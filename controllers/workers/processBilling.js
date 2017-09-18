'use strict';
var _ = require("underscore");

var timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

var sessionController = global.SixCRM.routes.include('controllers', 'entities/Session.js');
var transactionController = global.SixCRM.routes.include('controllers', 'entities/Transaction.js');
var rebillController = global.SixCRM.routes.include('controllers', 'entities/Rebill.js');
var productScheduleController = global.SixCRM.routes.include('controllers', 'entities/ProductSchedule.js');
var productController = global.SixCRM.routes.include('controllers', 'entities/Product.js');
var loadBalancerController = global.SixCRM.routes.include('controllers', 'entities/LoadBalancer.js');
var creditCardController = global.SixCRM.routes.include('controllers', 'entities/CreditCard.js');
var workerController = global.SixCRM.routes.include('controllers', 'workers/worker.js');

//Technical Debt:  This controller makes a lot of redundant database queries...  Needs a refactor.
class processBillingController extends workerController {

    constructor(){
        super();
        this.messages = {
            success: 'BILLED',
            failed: 'FAILED'
        };
    }

    execute(event){

        return this.acquireRebill(event)
			.then(this.validateRebill)
			.then((event) => { return this.processBilling(event); });

    }

    validateRebillForProcessing(rebill){

        return new Promise((resolve, reject) => {

            let bill_at_timestamp = timestamp.dateToTimestamp(rebill.bill_at);

            if(timestamp.getTimeDifference(bill_at_timestamp) < 0){ return reject(eu.getError('bad_request','Rebill is not eligible for processing at this time.')); }

            if(_.has(rebill, 'second_attempt')){  return reject(eu.getError('bad_request','The rebill has already been attempted three times.')); }

            if(_.has(rebill, 'first_attempt')){

                let time_difference = timestamp.getTimeDifference(rebill.first_attempt);

                if(time_difference < (60 * 60 * 24)){

                    return reject(eu.getError('bad_request','Rebill\'s first attempt is too recent.'));

                }

            }

            var promises = [];

            promises.push(rebillController.lisetTransactions(rebill));
            promises.push(rebillController.getProductSchedules(rebill));
            promises.push(rebillController.getParentSession(rebill));

            Promise.all(promises).then((promises) => {

                var transactions = promises[0];
                var product_schedules = promises[1];
                var parent_session = promises[2];

				//review this rule.  For instance, if there are successful transactions, but a single failed...
				//if(transactions.length > 0){ return reject(eu.getError('bad_request','Rebill already has processed transactions.')); }

				//session needs load balancers
				//Technical Debt:  With capacity

                if(product_schedules.length < 1){ return reject(eu.getError('not_found','A Rebill must be associated with atleast one product schedule.')); }

                sessionController.validate(parent_session).then((validated) => {

                    if(validated.errors.length > 0 ){ return reject( eu.getError('not_found','Invalid Session returned.')); }

                    var day_in_cycle = rebillController.calculateDayInCycle(parent_session.created);

                    if(!_.isNumber(day_in_cycle) || day_in_cycle < 0){
                        return reject( eu.getError('server','Invalid day in cycle returned for session.'));
                    }

                    var transaction_products = productScheduleController.getTransactionProducts(day_in_cycle, product_schedules);

                    promises = [];

                    transaction_products.forEach((transaction_product) => {

                        if(!_.has(transaction_product, "amount")){ return reject(eu.getError('validation','Transaction product missing an amount: '+transaction_product)); }

                        if(!_.has(transaction_product, "product")){ return reject(eu.getError('validation','Transaction product missing a product: '+transaction_product)); }

                        promises.push(productController.get({id: transaction_product.product}));

                    });

                    Promise.all(promises).then((promises) => {

                        var validation_promises = [];

                        promises.forEach((product) => {

                            validation_promises.push(productController.validate(product));

                        });

                        return validation_promises;

                    }).then((validation_promises) => {

                        Promise.all(validation_promises).then((validation_promises) => {

                            validation_promises.forEach((validation_result) => {

                                if(validation_result.errors.length > 0){

                                    return reject( eu.getError('validation','Invalid product associated with product schedule.'));

                                }
                            });

                            return resolve(true);

                        });

                    });

                });

            });

        });

    }

    getRebillProducts(rebill){

        return new Promise((resolve, reject) => {

            var promises = [];

            promises.push(rebillController.getProductSchedules(rebill));
            promises.push(rebillController.getParentSession(rebill));

            Promise.all(promises).then((promises) => {

                var product_schedules = promises[0];
                var parent_session = promises[1];

                var day_in_cycle = rebillController.calculateDayInCycle(parent_session.created);
                var transaction_products = productScheduleController.getTransactionProducts(day_in_cycle, product_schedules);

                resolve(transaction_products);

            });

        });

    }

    getProductSum(products){

        var amount = 0.0;

        products.forEach((product) => {
            amount += parseFloat(product.amount);
        });
        return amount;

    }

    processTransaction(rebill, products){

        return new Promise((resolve, reject) => {

            sessionController.getSessionHydrated(rebill.parentsession).then((session) => {

                var amount = this.getProductSum(products);

				//Technical Debt:  If they have multiple cards, how do I select a credit card?
                var creditcard = creditCardController.get({id: session.customer.creditcards[0]}).then((creditcard) => {

                    //Technical Debt: Deprecated!
                    loadBalancerController.process(session.campaign.loadbalancer, {customer: session.customer, creditcard: creditcard, amount: amount}).then((processor_response) => {

                        resolve(processor_response);

                    });

                });

            });

        });

    }

    createTransaction(rebill, products, processor_result){

        return new Promise((resolve, reject) => {

            var amount = this.getProductSum(products);

            sessionController.get({id: rebill.parentsession}).then((session) => {

                transactionController.putTransaction({session: session, rebill: rebill, amount: amount, products: products}, processor_result).then((transaction) => {

                    resolve(transaction);

                })

            });

        });

    }

    evaluateTransactionResponse(processor_response){

        return new Promise((resolve, reject) => {

            if(_.has(processor_response, "message") && processor_response.message == 'Success'){

                return resolve(this.messages.success);

            }

            return resolve(this.messages.failed);

        });

    }

	//Technical Debt:  This methodology could lead to state issues.
	//Technical Debt:  We should create a updateField method in the Entity class to address exactly this sort of functionality across

    markRebill(rebill){

        return new Promise((resolve, reject) => {

            rebillController.get({id: rebill.id}).then((rebill) => {

                let now = timestamp.createTimestampSeconds();

                if(_.has(rebill, 'first_attempt')){

                    rebill.second_attempt = now;

                }else{

                    rebill.first_attempt = now;

                }

                rebillController.update({entity: rebill}).then((rebill) => {

                    return resolve(true);

                });

            });

        });

    }

    processBilling(rebill) {

        return new Promise((resolve, reject) => {

            this.validateRebillForProcessing(rebill).then((validation) => {

                this.getRebillProducts(rebill).then((products) => {

                    this.processTransaction(rebill, products).then((processor_result) => {

                        this.createTransaction(rebill, products, processor_result).then((transaction) => {

                            this.evaluateTransactionResponse(processor_result).then((response) => {

                                if(response == this.messages.failed){

                                    this.markRebill(rebill).then(() => {

                                        return resolve(response);

                                    });

                                }

                                return resolve(response);

                            });

                        });

                    });

                });

            });

        });

    }

}

module.exports = new processBillingController();
