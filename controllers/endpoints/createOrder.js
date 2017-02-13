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
		
		return this.acquireBody(event).then(this.validateInput).then(this.createOrder);
		
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
	
	validateInput(event_body){
		
		return new Promise((resolve, reject) => {
			
			var orderjson;
			
			try{
				orderjson = JSON.parse(fs.readFileSync('./endpoints/createorder/schema/order.json','utf8'));
			} catch(e){
				throw new Error('Unable to load validation schemas.');	
			}
			
			var validation;
			try{
				var v = new Validator();
				validation = v.validate(event_body, orderjson);
			}catch(e){
				throw new Error('Unable to create validation class.');
			}
	
			if(validation['errors'].length > 0){	
				throw new Error(JSON.stringify({'Validation_errors: ':validation['errors']}));
			}
	
			if(_.has(event_body, 'email') && !validator.isEmail(event_body['email'])){
				throw new Error('"email" field must be a email address.');
			}
	
			if(_.has(event_body, 'shipping_email') && !validator.isEmail(event_body['shipping_email'])){
				validation.errors.push('"shipping_email" field must be a email address.');
			}
	
			if(_.has(event_body, 'ccnumber') && !validator.isCreditCard(event_body['ccnumber'])){
		
				if(process.env.stage == 'production'){
					validation.errors.push('"ccnumber" must be a credit card number.');
				}
		
			}
	
			if(validation['errors'].length > 0){
	
				throw new Error('One or more validation errors occurred: '+validation['errors']);		
		
			}
			
			resolve(event_body);
			
		});
		
	}
	
	createOrder (event_body) {
		
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
			
			var session = promises[0];
			var campaign = promises[1];
			var schedules_to_purchase = promises[2];
			var creditcard = promises[3];
			
			if(!_.isObject(session) || !_.has(session, 'id')){ throw new Error('No available session.'); }
				
			if(!_.isObject(campaign) || !_.has(campaign, 'id')){ throw new Error('No available campaign.'); }
			
			if(!_.isObject(creditcard) || !_.has(creditcard, 'id')){ throw new Error('No available creditcard.');}
				
			if(session.completed == 'true'){ throw new Error('The specified session is already complete.');} 
			
			if(!_.isArray(schedules_to_purchase) || (schedules_to_purchase.length < 1)){ throw new Error('No available schedules to purchase.');}
			
			sessionController.validateProductSchedules(schedules_to_purchase, session);
						
			campaignController.validateProductSchedules(schedules_to_purchase, campaign);	
				
			promises = [];
			var getCustomer = customerController.get(session.customer);	
			promises.push(getCustomer);
			
			return Promise.all(promises).then((promises) => {
				
				var customer = promises[0];
				
				//more validation
				if(!_.isObject(customer) || !_.has(customer, 'id')){ throw new Error('No available customer.'); }
				
				promises = [];
				var getTransactionProducts = productScheduleController.getTransactionProducts(0, schedules_to_purchase);				
				promises.push(getTransactionProducts);
				
				return Promise.all(promises).then((promises) => {

					var transaction_products = promises[1];
					
					//note refactor this to use the transaction products above....
					var amount = productScheduleController.productSum(0, schedules_to_purchase);
					
					var promises = [];
					var getProcessorResponse = loadBalancerController.process(campaign.loadbalancer, {customer: customer, creditcard: creditcard, amount: amount});
					promises.push(getProcessorResponse);
					
					return Promise.all(promises).then((promises) => {
					
						var processor_response = promises[0];
					
						//validate processor_response as being good
					
						promises = [];
						var getRebills = rebillController.createRebills(session, schedules_to_purchase, 0);
						promises.push(getRebills);
						
						return Promise.all(promises).then((promises) => {

							var rebills = promises[0];
							
							//hack, we need to support multiple schedules in a single order
							var rebill = rebills[0];
							
							promises = [];
							var saveTransaction = transactionController.putTransaction({session: session, rebill: rebill, amount: amount, products: transaction_products}, processor_response);
							promises.push(saveTransaction);
							
							return Promise.all(promises).then((promises) => {
							
								var transaction = promises[0];
								
								//this looks like a hack as well	
								var transactions = [transaction.id];
								
								promises = [];
								var rebillUpdates = rebillController.updateRebillTransactions(rebill, transactions);
								promises.push(rebillUpdates);
								
								return Promise.all(promises).then((promises) => {
									
									if(!_.has(processor_response, "message") || processor_response.message !== 'Success' || !_.has(processor_response, "results") || !_.has(processor_response.results, 'response') || processor_response.results.response !== '1'){	
										throw new Error('The processor didn\'t approve the transaction: '+processor_response.message);
									};
									
									promises = [];
									var addRebillToQueue = rebillController.addRebillToQueue(rebill, 'hold');
									var createNextRebills = rebillController.createRebills(session, schedules_to_purchase);
									var updateSession = sessionController.updateSessionProductSchedules(session, schedules_to_purchase);
									promises.push(addRebillToQueue);
									promises.push(createNextRebills);
									promises.push(updateSession);
									
									return Promise.all(promises).then((promises) => {
									
										var rebills_added_to_queue = promises[0];
										var next_rebills = promises[1];
										var updated_session = promises[2];
										
										//add some validation here...
										
										return transaction;
										
									});
									
								});
								
							});
							
						});
						
					});
			
				});
								
			});
			
		});
				
	}
	
}

module.exports = new createOrderController();