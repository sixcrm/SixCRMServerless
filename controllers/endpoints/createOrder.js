'use strict';
const _ = require("underscore");
const validator = require('validator');
const Validator = require('jsonschema').Validator;
const luhn = require("luhn");

const du = global.routes.include('lib', 'debug-utilities.js');
const trackerutilities = global.routes.include('lib', 'tracker-utilities.js');

var sessionController = global.routes.include('controllers', 'entities/Session.js');
var customerController = global.routes.include('controllers', 'entities/Customer.js');
var productScheduleController = global.routes.include('controllers', 'entities/ProductSchedule.js');
var campaignController = global.routes.include('controllers', 'entities/Campaign.js');
var transactionController = global.routes.include('controllers', 'entities/Transaction.js');
var creditCardController = global.routes.include('controllers', 'entities/CreditCard.js');
var loadBalancerController = global.routes.include('controllers', 'entities/LoadBalancer.js');
var rebillController = global.routes.include('controllers', 'entities/Rebill.js');
var endpointController = global.routes.include('controllers', 'endpoints/endpoint.js');

/*
* Push the pingback to the transaction
* Pingback parsing and execution
* Push the Redshift rows (Event and Transaction)
*/

class createOrderController extends endpointController{

    constructor(){
        super({
            required_permissions: [
                'user/read',
                'account/read',
                'session/create',
                'session/read',
                'session/update',
                'campaign/read',
                'creditcard/create',
                'creditcard/update',
                'creditcard/read',
                'productschedule/read',
                'loadbalancer/read',
                'rebill/read',
                'rebill/create',
                'rebill/update',
                'product/read',
                'affiliate/read',
                'notification/create'
            ]
        });

        this.notification_parameters = {
            type: 'order',
            action: 'added',
            title: 'A new order',
            body: 'A new order has been created.'
        };

    }

    execute(event){

        return this.preprocessing((event))
      		.then(this.acquireBody)
      		.then(this.validateInput)
      		.then(this.getOrderInfo)
          .then(this.getOrderCampaign)
          .then(this.validateInfo)
      		.then(this.updateCustomer)
      		.then(this.getTransactionInfo)
      		.then(this.createOrder)
          .then((info) => this.pushToRedshift(info))
          .then((info) => this.handleTracking(info))
      		.then((info) => this.postOrderProcessing(info))
      		.then((pass_through) => this.handleNotifications(pass_through))
      		.catch((error) => {
          du.error(error);
          throw error;
      });

    }

    acquireBody(event){

        du.debug('Acquire Body');

        var duplicate_body;

        try {
            duplicate_body = JSON.parse(event['body']);
        } catch (e) {
            duplicate_body = event.body;
        }

        return Promise.resolve(duplicate_body);

    }

    validateInput(event){

        du.debug('Validate Input');

        return new Promise((resolve, reject) => {

            var order_schema;
            var address_schema;
            var creditcard_schema;

            try{

                order_schema = global.routes.include('model', 'endpoints/order');
                address_schema = global.routes.include('model', 'general/address');
                creditcard_schema = global.routes.include('model', 'general/creditcard');


            } catch(e){
                du.warning(e);
                return reject(new Error('Unable to load validation schemas.'));
            }

            var validation;
            var params = JSON.parse(JSON.stringify(event || {}));

            try{
                var v = new Validator();

                v.addSchema(address_schema, '/Address');
                v.addSchema(creditcard_schema, '/CreditCard');

                validation = v.validate(params, order_schema);

            }catch(e){
                return reject(new Error('Unable to instantiate validator.'));
            }

            if(validation['errors'].length > 0) {
                var error = {
                    message: 'One or more validation errors occurred.',
                    issues: validation.errors.map(e => e.message)
                };

                return reject(error);
            }


            if(!luhn.validate(params.creditcard.number)){

                return reject(new Error('Invalid Credit Card number.'))

            }else{

                du.debug('Credit Card Valid');

            }

            return resolve(params);

        });

    }


    getOrderInfo(event_body) {

        du.debug('Get Order Info');

        var promises = [];

        var getSession = sessionController.get(event_body['session']);

        var getProductSchedules = productScheduleController.getProductSchedules(event_body['product_schedules']);

        var getCreditCard	= creditCardController.createCreditCardObject(event_body['creditcard']).then((creditcard) => {
            return creditCardController.storeCreditCard(creditcard);
        });

        promises.push(getSession);
        promises.push(getProductSchedules);
        promises.push(getCreditCard);

        return Promise.all(promises).then((promises) => {

            var info = {
                session: promises[0],
                schedulesToPurchase: promises[1],
                creditcard: promises[2]
            };

            return info;

        })

    }

    getOrderCampaign(info){

        du.debug('Get Order Campaign');

        if(!_.isObject(info.session) || !_.has(info.session, 'campaign')){
            throw new Error('No available session campaign.');
        }

        return campaignController.getHydratedCampaign(info.session['campaign']).then((campaign) => {

            if(!_.isObject(campaign) || !_.has(campaign, 'id')){
                throw new Error('No available campaign.');
            }

            info['campaign'] = campaign;

            return info;

        });

    }

    validateInfo(info){

        if(!_.isObject(info.session) || !_.has(info.session, 'id')){
            throw new Error('No available session.');
        }

        if(!_.isObject(info.creditcard) || !_.has(info.creditcard, 'id')){
            throw new Error('No available creditcard.');
        }

        if(info.session.completed == 'true'){
            throw new Error('The specified session is already complete.');
        }

        if(!_.isArray(info.schedulesToPurchase) || (info.schedulesToPurchase.length < 1)){
            throw new Error('No available schedules to purchase.');
        }

        sessionController.validateProductSchedules(info.schedulesToPurchase, info.session);

        campaignController.validateProductSchedules(info.schedulesToPurchase, info.campaign);

        return Promise.resolve(info);

    }

    updateCustomer(info){

        du.debug('Update Customer');

        return new Promise((resolve, reject) => {

            customerController.addCreditCard(info.session.customer, info.creditcard).then((customer) => {

                return resolve(info);

            }).catch((error) => {

                return reject(error);

            });

        });

    }


    getTransactionInfo(info) {

        du.debug('Get Transaction Info');

        var promises = [];

        var getCustomer = customerController.get(info.session.customer);
        var getTransactionProducts = productScheduleController.getTransactionProducts(0, info.schedulesToPurchase);

		    // Note:  This creates the rebill for NOW such that we have a rebill to append the transaction to.
        var getRebills = rebillController.createRebills(info.session, info.schedulesToPurchase, 0);

        promises.push(getCustomer);
        promises.push(getTransactionProducts);
        promises.push(getRebills);

        return Promise.all(promises).then((promises) => {

            info.customer = promises[0];
            info.transactionProducts = promises[1];
            info.rebills = promises[2];

			      //more validation
            if(!_.isObject(info.customer) || !_.has(info.customer, 'id')) {
 			 	        throw new Error('No available customer.');
            }

			      //Technical Debt: refactor this to use the transaction products above....
            info.amount = productScheduleController.productSum(0, info.schedulesToPurchase);

            return info;

        });

    }



    createOrder(info) {

        du.debug('Create Order');

        return loadBalancerController.process( info.campaign.loadbalancer, {customer: info.customer, creditcard: info.creditcard, amount: info.amount})
		    .then((processor) => {

        du.highlight(processor);
          //Technical Debt:  Are there further actions to take if a transaction is denied?

          //validate processor
        if(!_.has(processor, "message") || processor.message !== 'Success' || !_.has(processor, "results") || !_.has(processor.results, 'response') || processor.results.response !== '1'){

            throw new Error('The processor didn\'t approve the transaction: ' + processor.message);

        }

        info.processor = processor;

        return transactionController.putTransaction({session: info.session, rebill: info.rebills[0], amount: info.amount, products: info.transactionProducts}, processor).then((transaction) => {

            //Techincal Debt: validate transaction above

            info.transaction = transaction;

            du.debug('Info:', info);

            return info;

        });

    });

    }

    pushEventsRecord(info){

        du.debug('Push Events Record');

        let product_schedule = info.schedulesToPurchase[0].id;

        return this.pushEventToRedshift('order', info.session, product_schedule).then((result) => {

            du.info(info);

            return info;

        });

    }

    pushTransactionsRecord(info){

        du.debug('Push Transactions Record');

        return this.pushTransactionToRedshift(info).then((result) => {

            du.info(info);

            return info;

        });

    }

    pushToRedshift(info){

        du.debug('Push To Redshift');

        let promises = [];

        promises.push(this.pushEventsRecord(info));
        promises.push(this.pushTransactionsRecord(info));

        return Promise.all(promises).then((promises) => {

            return info;

        });

    }

    handleTracking(info){

        du.debug('Handle Tracking');

        return trackerutilities.handleTracking(info.session.id, info).then((results) => {

            return info;

        });

    }

    postOrderProcessing(info) {

        du.debug('Post Order Processing');

		//Technical Debt: this looks like a hack as well
        var transactions = [info.transaction.id];

		//Technical Debt: hack, we need to support multiple schedules in a single order
        var rebill = info.rebills[0];

        du.info(rebill);

        var promises = [];
        var addRebillToQueue = rebillController.addRebillToQueue(rebill, 'hold');
        var updateSession = sessionController.updateSessionProductSchedules(info.session, info.schedulesToPurchase);
        var rebillUpdates = rebillController.updateRebillTransactions(rebill, transactions);

		    //Technical Debt:  This is deprecated.  Instead, add the session id object to the rebill queue
        //var createNextRebills = rebillController.createRebills(info.session, info.schedulesToPurchase);

        promises.push(addRebillToQueue);
        //promises.push(createNextRebills);
        promises.push(updateSession);
        promises.push(rebillUpdates);

        return Promise.all(promises).then((promises) => {

            var rebills_added_to_queue = promises[0];
            //var next_rebills = promises[1];
            var updated_session = promises[2];
            var updateRebills = promises[3];

			//Technical Debt: add some validation here...

            return info.transaction;

        });

    }

    handleNotifications(pass_through){

        return this.issueNotifications(this.notification_parameters)
			.then(() => pass_through);

    }

}

module.exports = new createOrderController();
