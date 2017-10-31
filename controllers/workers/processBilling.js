'use strict';
var _ = require("underscore");

var timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

var sessionController = global.SixCRM.routes.include('controllers', 'entities/Session.js');
var transactionController = global.SixCRM.routes.include('controllers', 'entities/Transaction.js');
var rebillController = global.SixCRM.routes.include('controllers', 'entities/Rebill.js');
var productScheduleController = global.SixCRM.routes.include('controllers', 'entities/ProductSchedule.js');
var productController = global.SixCRM.routes.include('controllers', 'entities/Product.js');
var loadBalancerController = global.SixCRM.routes.include('controllers', 'entities/LoadBalancer.js');
var creditCardController = global.SixCRM.routes.include('controllers', 'entities/CreditCard.js');
var workerController = global.SixCRM.routes.include('controllers', 'workers/worker.js');

let ParametersController = global.SixCRM.routes.include('providers', 'Parameters.js');

//Technical Debt:  This controller makes a lot of redundant database queries...  Needs a refactor.
class processBillingController extends workerController {

    constructor(){
      super();

      this.messages = {
        success: 'BILLED',
        failed: 'FAILED'
      };

      this.parameter_definition = {
        execute: {
          required: {
            event: 'event'
          },
          optional:{}
        }

      }

      this.parameter_validation = {
        event: global.SixCRM.routes.path('model', 'workers/processBilling/event.json'),
        rebill: global.SixCRM.routes.path('model', 'entities/rebill.json'),
        transactionproducts: global.SixCRM.routes.path('model', 'workers/processBilling/transactionproducts.json'),
        //transactions: global.SixCRM.routes.path('model', 'workers/processBilling/transactions.json'),
        productschedules:global.SixCRM.routes.path('model', 'workers/processBilling/productschedules.json'),
        parentsession: global.SixCRM.routes.path('model', 'entities/session.json')
      }

      const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');

      this.parameters = new Parameters({
        validation: this.parameter_validation,
        definition: this.parameter_definition
      });

    }

    execute(event){

      du.debug('Execute');

      return this.setParameters({argumentation: {event: event}, action: 'execute'})
      .then(() => {
        let event = this.parameters.get('event');

        return this.acquireRebill(event)
      })
			.then(() => {
        let rebill = this.parameters.get('rebill');

        return this.validateRebill(rebill);
      })
			.then(() => this.processBilling());

    }

    setParameters(thing){

      du.debug('Set Parameters');

      this.parameters.setParameters(arguments[0]);

      return Promise.resolve(true);

    }

    processBilling() {

      du.debug('Process Billing');

      let rebill = this.parameters.get('rebill');

      return this.validateRebillForProcessing(rebill)
      .then((validation) => this.getRebillProducts(rebill))
      .then((products) => this.processTransaction(rebill, products))
      .then((processor_result) => this.createTransaction(rebill, products, processor_result))
      .then((transaction) => this.evaluateTransactionResponse(processor_result))
      .then((response) => {

        if(response == this.messages.failed){

          return this.markRebill(rebill).then(() => {

            return response;

          });

        }

        return response;

      });

    }


    //validateRebillForProcessing(){}

    validateRebillTimestamp(){

      du.debug('Validate Rebill Timestamp');

      let rebill = this.parameters.get('rebill');

      let bill_at_timestamp = timestamp.dateToTimestamp(rebill.bill_at);

      if(timestamp.getTimeDifference(bill_at_timestamp) < 0){
        eu.throwError('server', 'Rebill is not eligible for processing at this time.');
      }

      return Promise.resolve(true);

    }

    validateAttemptRecord(){

      du.debug('Validate Attempt Record');

      let rebill = this.parameters.get('rebill');

      if(_.has(rebill, 'second_attempt')){

        eu.throwError('server','The rebill has already been attempted three times.');

      }

      if(_.has(rebill, 'first_attempt')){

        let time_difference = timestamp.getTimeDifference(rebill.first_attempt);

        if(time_difference < (60 * 60 * 24)){

          eu.throwError('serber','Rebill\'s first attempt is too recent.');

        }

      }

      return Promise.resolve(true);

    }

    acquireRebillProperties(){

      du.debug('Acquire Rebill Properties');

      let rebill = this.parameters.get('rebill');

      var promises = [];

      //promises.push(rebillController.listTransactions(rebill));
      promises.push(rebillController.listProductSchedules(rebill));
      promises.push(rebillController.getParentSession(rebill));

      return Promise.all(promises).then((promises) => {

        du.warning(promises);

        //note: what happens if these don't exist

        //this.parameters.set('transactions', promises[0]);
        this.parameters.set('productschedules', promises[1]);
        this.parameters.set('parentsession', promises[2]);

        return true;

      });

    }

    validateProductSchedules(){

      du.debug('Validate Product Schedules');

      let product_schedules = this.parameters.get('productschedules');

      if(!arrayutilities.nonEmpty(product_schedules)){

        eu.throwError('server', 'A Rebill must be associated with atleast one product schedule.');

      }

      return Promise.resolve(true);

    }

    validateSession(){

      du.debug('Validate Session');

      let session = this.parameters.get('session');

      var day_in_cycle = rebillController.calculateDayInCycle(session.created_at);

      if(!_.isNumber(day_in_cycle) || day_in_cycle < 0){
          return reject( eu.getError('server','Invalid day in cycle returned for session.'));
      }

      return Promise.resolve(true);

    }

    validateProducts(){

      du.debug('Validate Product Session');

      let session = this.parameters.get('session');
      let productschedules = this.parameters.get('productschedules');
      let day_in_cycle = rebillController.calculateDayInCycle(session.created_at);

      let transaction_products = productScheduleController.getTransactionProducts(day_in_cycle, product_schedules);

      this.parameters.set('transactionproducts', transaction_products);

      return Promise.resolve(true);

    }

    validateRebillForProcessing(rebill){

      return this.validateRebillTimestamp()
      .then(() => this.validateAttemptRecord())
      .then(() => this.acquireRebillProperties())
      .then(() => this.validateProductSchedules())
      .then(() => this.validateSession())
      .then(() => this.validateProducts())
      .catch((error) => {
        return Promise.reject(error);
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

}

module.exports = new processBillingController();
