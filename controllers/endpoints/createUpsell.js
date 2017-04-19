'use strict';
const _ = require("underscore");
const validator = require('validator');
const Validator = require('jsonschema').Validator;

const du = require('../../lib/debug-utilities.js');
const notificationutilities = require('../../lib/notification-utilities');

var sessionController = require('../../controllers/Session.js');
var customerController = require('../../controllers/Customer.js');
var productScheduleController = require('../../controllers/ProductSchedule.js');
var campaignController = require('../../controllers/Campaign.js');
var transactionController = require('../../controllers/Transaction.js');
var creditCardController = require('../../controllers/CreditCard.js');
var loadBalancerController = require('../../controllers/LoadBalancer.js');
var rebillController = require('../../controllers/Rebill.js');
var endpointController = require('../../controllers/endpoints/endpoint.js');

class createUpsellController extends endpointController{

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
            message: 'A new order (upsell) has been created.'
        };

    }

    execute(event){

        return this.preprocessing((event))
		.then(this.acquireBody)
		.then(this.validateInput)
		.then(this.getUpsellProperties)
		.then(this.getUpsellAssociatedProperties)
		.then(this.getTransactionInfo)
		.then(this.createUpsell)
		.then(this.postUpsellProcessing)
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

            var upsell_schema;

            try{
                upsell_schema = require('../../model/upsell');
            } catch(e){
                return reject(new Error('Unable to load validation schemas.'));
            }

            var validation;
            var params = JSON.parse(JSON.stringify(event || {}));

            try{
                var v = new Validator();

                validation = v.validate(params, upsell_schema);
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

            return resolve(params);

        });

    }

    getUpsellProperties(event_body){

        du.debug('Get Upsell Properties');

        var promises = [];

        var getSession = sessionController.get(event_body['session_id']);
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

    handleNotifications(pass_through){

        return this.issueNotifications(this.notification_parameters)
			.then(() => pass_through);

    }

}

module.exports = new createUpsellController();
