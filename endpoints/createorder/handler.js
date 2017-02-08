'use strict';
const _ = require("underscore");
const fs = require('fs');
const validator = require('validator');
const Validator = require('jsonschema').Validator;
const v = new Validator();
const request = require('request');
const querystring = require('querystring');
const uuidV4 = require('uuid/v4');

var lr = require('../../lib/lambda-response.js');
var timestamp = require('../../lib/timestamp.js');

var sessionController = require('../../controllers/Session.js');
var customerController = require('../../controllers/Customer.js');
//var productController = require('../../controllers/Product.js');
var productScheduleController = require('../../controllers/ProductSchedule.js');
var campaignController = require('../../controllers/Campaign.js');
var transactionController = require('../../controllers/Transaction.js');
var creditCardController = require('../../controllers/CreditCard.js');
var loadBalancerController = require('../../controllers/LoadBalancer.js');
var rebillController = require('../../controllers/Rebill.js');

module.exports.createorder= (event, context, callback) => {
    
	var duplicate_body;
	try {
    	duplicate_body = JSON.parse(event['body']);
	} catch (e) {
		duplicate_body = event.body;
	}
		
	var orderjson;
	try{
		orderjson = JSON.parse(fs.readFileSync('./endpoints/createorder/schema/order.json','utf8'));
	} catch(e){
		return lr.issueError('Unable to load validation schemas.', 500, event, e, callback);	
	}
			
	var validation;
	try{
		var v = new Validator();
		validation = v.validate(duplicate_body, orderjson);
	}catch(e){
		return lr.issueError('Unable to create validation class.', 500, event, e, callback);
	}
	
	if(validation['errors'].length > 0){	
		lr.issueError('One or more validation errors occurred.', 500, event, new Error(JSON.stringify({'validation_errors':validation['errors']})), callback);
	}
	
	if(_.has(duplicate_body, 'email') && !validator.isEmail(duplicate_body['email'])){
		validation.errors.push('"email" field must be a email address.');
	}
	
	if(_.has(duplicate_body, 'shipping_email') && !validator.isEmail(duplicate_body['shipping_email'])){
		validation.errors.push('"shipping_email" field must be a email address.');
	}
	
	if(_.has(duplicate_body, 'ccnumber') && !validator.isCreditCard(duplicate_body['ccnumber'])){
		
		if(process.env.stage == 'production'){
			validation.errors.push('"ccnumber" must be a credit card number.');
		}
		
	}
	
	//we don't need to calculate this here...
	if(_.has(duplicate_body, 'shipping') && !validator.isCurrency(duplicate_body['shipping'])){
		validation.errors.push('"shipping" must be a currency amount.');
	}
	
	//we don't need to calculate this here...
	if(_.has(duplicate_body, 'tax') && !validator.isCurrency(duplicate_body['tax'])){
		validation.errors.push('"tax" must be a currency amount.');
	}
	
	if(validation['errors'].length > 0){
	
		return lr.issueError('One or more validation errors occurred.', 500, event, new Error({'validation_errors':validation['errors']}), callback);		
		
	}
	
	sessionController.get(duplicate_body['session_id']).then((session) => {
		
		if(!_.isObject(session) || !_.has(session, 'id')){ throw new Error('No available session.');}
		
		if(session.completed == 'true'){ throw new Error('The specified session is already complete.');} 
		
		customerController.get(session.customer).then((customer) => {

			if(!_.isObject(customer) || !_.has(customer, 'id')){ throw new Error('No available customer.');}

			var creditcard = creditCardController.createCreditCardObject(duplicate_body);
			
			creditCardController.storeCreditCard(creditcard, customer.creditcards).then((creditcard) => {
				
				if(!_.isObject(creditcard) || !_.has(creditcard, 'id')){ throw new Error('No available creditcard.');}

				productScheduleController.getProductSchedules(duplicate_body['product_schedules']).then((schedules_to_purchase) => {						
					
					if(!_.isArray(schedules_to_purchase) || (schedules_to_purchase.length < 1)){ throw new Error('No available schedules to purchase.');}
					
					campaignController.getHydratedCampaign(duplicate_body['campaign_id']).then((campaign) => {
						
						if(!_.isObject(campaign) || !_.has(campaign, 'id')){ throw new Error('No available campaign.');}
						
						sessionController.validateProductSchedules(schedules_to_purchase, session);
						
						campaignController.validateProductSchedules(schedules_to_purchase, campaign);

						var amount = productScheduleController.productSum(0, schedules_to_purchase);
						
						//need some fucking unit tests here...
						loadBalancerController.process(campaign.loadbalancer, {customer: customer, creditcard: creditcard, amount: amount}).then((processor_response) => {
						
							//this is intended to process multiple product schedules purchased...																	
							rebillController.createRebills(session, schedules_to_purchase, 0).then((rebill) =>{
								
								//hack, we need to support multiple schedules in a single order
								rebill = rebill[0];
								
								transactionController.putTransaction({session: session, rebill: rebill, amount: amount}, processor_response).then((transaction) => {
								
									if(!_.isObject(transaction) || !_.has(transaction, 'id')){ throw new Error('No available transaction.');}
									
									//this looks like a hack as well	
									var transactions = [transaction.id];
									
									rebillController.updateRebillTransactions(rebill, transactions).then((rebill) => {
									
										if(_.has(processor_response, "message") && processor_response.message == 'Success' && _.has(processor_response, "results") && _.has(processor_response.results, 'response') && processor_response.results.response == '1'){	
											
											rebillController.addRebillToQueue(rebill, 'hold').then(() => {

												rebillController.createRebills(session, schedules_to_purchase).then((nextrebill) => {

													sessionController.updateSessionProductSchedules(session, schedules_to_purchase).then((session) => {

														lr.issueResponse(200, {
															message: 'Success',
															results: transaction
														}, callback);
							
													}).catch((error) => {
														lr.issueError(error, 500, event, error, callback);
													});
										
												}).catch((error) => {
													lr.issueError(error, 500, event, error, callback);
												});
											
											}).catch((error) => {
												lr.issueError(error, 500, event, error, callback);
											});
											
										}else{
											
											//note, let's confirm that this makes sense
											lr.issueResponse(200, {
												message: 'Failed',
												results: processor_response
											}, callback);
											
										}
									
									}).catch((error) => {
										lr.issueError(error, 500, event, error, callback);
									});									
							
								}).catch((error) => {
									lr.issueError(error, 500, event, error, callback);
								});
						
							}).catch((error) => {
								lr.issueError(error, 500, event, error, callback);
							});
				
						}).catch((error) => {
							lr.issueError(error, 500, event, error, callback);
						});
					
					}).catch((error) => {
						lr.issueError(error, 500, event, error, callback);
					});
				
				}).catch((error) => {
					lr.issueError(error, 500, event, error, callback);
				});
				
			}).catch((error) => {
				lr.issueError(error, 500, event, error, callback);
			});
			
		}).catch((error) => {
			lr.issueError(error, 500, event, error, callback);
		});
		
	}).catch((error) => {
		lr.issueError(error, 500, event, error, callback);
	});
	
};