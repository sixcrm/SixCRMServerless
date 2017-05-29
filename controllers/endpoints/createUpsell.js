'use strict';
const _ = require("underscore");
const Validator = require('jsonschema').Validator;

const du = global.routes.include('lib', 'debug-utilities.js');
const notificationProvider = global.routes.include('controllers', 'providers/notification/notification-provider');

var sessionController = global.routes.include('controllers', 'entities/Session.js');
var customerController = global.routes.include('controllers', 'entities/Customer.js');
var productScheduleController = global.routes.include('controllers', 'entities/ProductSchedule.js');
var campaignController = global.routes.include('controllers', 'entities/Campaign.js');
var transactionController = global.routes.include('controllers', 'entities/Transaction.js');
var creditCardController = global.routes.include('controllers', 'entities/CreditCard.js');
var loadBalancerController = global.routes.include('controllers', 'entities/LoadBalancer.js');
var rebillController = global.routes.include('controllers', 'entities/Rebill.js');
const transactionEndpointController = global.routes.include('controllers', 'endpoints/transaction.js');

/*
* Push the pingback to the transaction
* Pingback parsing and execution
* Push the Redshift rows (Event and Transaction)
*/

class createUpsellController extends transactionEndpointController{

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
            ],
            notification_parameters: {
                type: 'order',
                action: 'added',
                title: 'A new order (upsell)',
                body: 'A new order (upsell) has been created.'
            }
        });

    }

    execute(event){

        return this.preprocessing((event))
  		.then(this.acquireBody)
  		.then((event) => this.validateInput(event, this.validateEventSchema))
  		.then(this.getUpsellProperties)
  		.then(this.getUpsellAssociatedProperties)
  		.then(this.getTransactionInfo)
  		.then(this.createUpsell)
      .then((info) => this.pushToRedshift(info))
  		.then((info) => this.postUpsellProcessing(info))
  		.then((pass_through) => this.handleNotifications(pass_through));

    }

    validateEventSchema(event){

        let upsell_schema = global.routes.include('model', 'endpoints/upsell');
        var v = new Validator();

        return v.validate(event, upsell_schema);

    }

    getUpsellProperties(event_body){

        du.debug('Get Upsell Properties');

        var promises = [];

        var getSession = sessionController.get(event_body['session']);
        var getProductSchedules = productScheduleController.getProductSchedules(event_body['product_schedules']);

        du.debug('Product Schedules', event_body['product_schedules']);
        du.debug(getProductSchedules);

        promises.push(getSession);
        promises.push(getProductSchedules);

        return Promise.all(promises).then((promises) => {

            var info = {
                session: promises[0],
                campaign:  {},
                schedulesToPurchase: promises[1],
                creditcard: {}
            };

            du.debug('Info Object:', info);

            if(!_.isObject(info.session) || !_.has(info.session, 'id')){
                throw new Error('No available session.');
            }

            if(info.session.completed == 'true'){
                throw new Error('The specified session is already complete.');
            }

            if(!_.isArray(info.schedulesToPurchase) || (info.schedulesToPurchase.length < 1)){
                throw new Error('No available schedules to purchase.');
            }

            sessionController.validateProductSchedules(info.schedulesToPurchase, info.session);

            return info;

        });

    }

    getUpsellAssociatedProperties(info){

        du.debug('Get Associated Upsell Properties');

        var promises = [];

        var getCampaign = campaignController.getHydratedCampaign(info.session.campaign);
        var getCreditCard = sessionController.getSessionCreditCard(info.session);

        promises.push(getCampaign);
        promises.push(getCreditCard);

        return Promise.all(promises).then((promises) => {

            info['campaign'] = promises[0];
            info['creditcard'] = promises[1];

            du.debug('Info', info);

            if(!_.isObject(info.campaign) || !_.has(info.campaign, 'id')){
 			 	throw new Error('No available campaign.');
            }

            if(!_.isObject(info.creditcard) || !_.has(info.creditcard, 'id')){
 			 	throw new Error('No available creditcard.');
            }

            campaignController.validateProductSchedules(info.schedulesToPurchase, info.campaign);

            return info;

        });

    }

    getTransactionInfo(info) {

        du.debug('Get Transaction Info');

        var promises = [];

        var getCustomer = customerController.get(info.session.customer);
        var getTransactionProducts = productScheduleController.getTransactionProducts(0, info.schedulesToPurchase);
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

    createUpsell(info) {

        du.debug('Create Upsell');

        return loadBalancerController.process( info.campaign.loadbalancer, {customer: info.customer, creditcard: info.creditcard, amount: info.amount})
		.then((processor) => {

			//Technical Debt:  Are there further actions to take if a transaction is denied?

			//validate processor
    if( !_.has(processor, "message") || processor.message !== 'Success' ||
				!_.has(processor, "results") || !_.has(processor.results, 'response') || processor.results.response !== '1'
			) {
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

    postUpsellProcessing(info) {

        du.debug('Post Upsell Processing');

		//Technical Debt: this looks like a hack as well
        var transactions = [info.transaction.id];

		//Technical Debt: hack, we need to support multiple schedules in a single upsell
        var rebill = info.rebills[0];

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

			//add some validation here...

            return info.transaction;

        });

    }

}

module.exports = new createUpsellController();
