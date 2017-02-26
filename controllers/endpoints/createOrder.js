'use strict';
const _ = require("underscore");
const fs = require('fs');
const validator = require('validator');
const Validator = require('jsonschema').Validator;
const v = new Validator();
const request = require('request');
const querystring = require('querystring');
const uuidV4 = require('uuid/v4');

var timestamp = require('../../lib/timestamp.js');

var sessionController = require('../../controllers/Session.js');
var customerController = require('../../controllers/Customer.js');
var productScheduleController = require('../../controllers/ProductSchedule.js');
var campaignController = require('../../controllers/Campaign.js');
var transactionController = require('../../controllers/Transaction.js');
var creditCardController = require('../../controllers/CreditCard.js');
var loadBalancerController = require('../../controllers/LoadBalancer.js');
var rebillController = require('../../controllers/Rebill.js');

class createOrderController {

	constructor(){

	}

	execute(event){

		return this.acquireBody(event)
		.then(this.validateInput)
		.then(this.getOrderInfo)
		.then(this.getTransactionInfo)
		.then(this.createOrder)
		.then(this.postOrderProcessing)
		.catch((err) => {
			console.log(err);
			throw err;
		});

	}

	acquireBody(event){

		return new Promise((resolve, reject) => {

			var duplicate_body;
			try {
				duplicate_body = JSON.parse(event['body']);
			} catch (e) {
				duplicate_body = event.body;
			}

			resolve(duplicate_body);

		});

	}

	validateInput(event){

		return new Promise((resolve, reject) => {


			var order_schema;
			try{
				order_schema = require('../../model/order');
			} catch(e){
				return reject(new Error('Unable to load validation schemas.'));
			}

			var validation;
			var params = JSON.parse(JSON.stringify(event || {}));

			try{
				var v = new Validator();
				validation = v.validate(params, order_schema);
			}catch(e){
				return reject(new Error('Unable to instantiate validator.'));
			}


			//Are these ever attached?
			if(params.email && !validator.isEmail(params.email)){
				validation.errors.push({message: '"email" field must be a email address.'});
			}

			//Are these ever attached?
			if(params.shipping_email && !validator.isEmail(params.shipping_email)){
				validation.errors.push({message: '"shipping_email" field must be a email address.'});
			}

			if(!validator.isCreditCard(params.ccnumber || '')){

				if(process.env.stage == 'production'){
					validation.errors.push({message: '"ccnumber" must be a credit card number.'});
				}

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


	getOrderInfo(event_body) {

		var promises = [];
		var getSession = sessionController.get(event_body['session_id']);
		var getCampaign = campaignController.getHydratedCampaign(event_body['campaign_id']);
		var getProductSchedules = productScheduleController.getProductSchedules(event_body['product_schedules']);
		var getCreditCard	= creditCardController.createCreditCardObject(event_body).then((creditcard) => { return creditCardController.storeCreditCard(creditcard) });

		promises.push(getSession);
		promises.push(getCampaign);
		promises.push(getProductSchedules);
		promises.push(getCreditCard);

		return Promise.all(promises).then((promises) => {

			var info = {
				session: promises[0],
			  campaign:  promises[1],
			  schedulesToPurchase: promises[2],
			  creditcard: promises[3]
			};

			if(!_.isObject(info.session) || !_.has(info.session, 'id')){
 			 	throw new Error('No available session.');
 		 	}

			if(!_.isObject(info.campaign) || !_.has(info.campaign, 'id')){
 			 	throw new Error('No available campaign.');
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

			return info;
		})

	}


	getTransactionInfo(info) {

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


			//note refactor this to use the transaction products above....
			info.amount = productScheduleController.productSum(0, info.schedulesToPurchase);

			return info;
		});
	}



	createOrder(info) {

		return loadBalancerController.process( info.campaign.loadbalancer, {customer: info.customer, creditcard: info.creditcard, amount: info.amount})
		.then((processor) => {
			//Technical Debt:  What happens if this is denied?!

			//validate processor
			if( !_.has(processor, "message") || processor.message !== 'Success' ||
				!_.has(processor, "results") || !_.has(processor.results, 'response') || processor.results.response !== '1'
			) {
				throw new Error('The processor didn\'t approve the transaction: ' + processor.message);
			};

			info.processor = processor;

			return transactionController.putTransaction({session: info.session, rebill: info.rebills[0], amount: info.amount, products: info.transactionProducts}, processor).then((transaction) => {

				//TODO:validate transaction above
				info.transaction = transaction;
				console.log(info);

				return info;
			});
		});

	}

	postOrderProcessing(info) {

		//this looks like a hack as well
		var transactions = [info.transaction.id];

		//hack, we need to support multiple schedules in a single order
		var rebill = info.rebills[0];

		var promises = [];
		var addRebillToQueue = rebillController.addRebillToQueue(rebill, 'hold');
		var updateSession = sessionController.updateSessionProductSchedules(info.session, info.schedulesToPurchase);
		var rebillUpdates = rebillController.updateRebillTransactions(rebill, transactions);
		
		//Technical Debt:  This is deprecated.  Instead, add the session id object to the rebill queue
		var createNextRebills = rebillController.createRebills(info.session, info.schedulesToPurchase);

		promises.push(addRebillToQueue);
		promises.push(createNextRebills);
		promises.push(updateSession);
		promises.push(rebillUpdates);

		return Promise.all(promises).then((promises) => {

			var rebills_added_to_queue = promises[0];
			var next_rebills = promises[1];
			var updated_session = promises[2];
			var updateRebills = promises[3];

			//add some validation here...

			return info.transaction;

		});
	}

}

module.exports = new createOrderController();
