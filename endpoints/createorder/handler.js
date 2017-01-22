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
var productController = require('../../controllers/Product.js');
var campaignController = require('../../controllers/Campaign.js');
var transactionController = require('../../controllers/Transaction.js');
var creditCardController = require('../../controllers/CreditCard.js');
var loadBalancerController = require('../../controllers/LoadBalancer.js');

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
	
	if(_.has(duplicate_body, 'shipping') && !validator.isCurrency(duplicate_body['shipping'])){
		validation.errors.push('"shipping" must be a currency amount.');
	}
	
	if(_.has(duplicate_body, 'tax') && !validator.isCurrency(duplicate_body['tax'])){
		validation.errors.push('"tax" must be a currency amount.');
	}
	
	if(validation['errors'].length > 0){
	
		return lr.issueError('One or more validation errors occurred.', 500, event, new Error({'validation_errors':validation['errors']}), callback);		
		
	}

	sessionController.getSession(duplicate_body['session_id']).then((session) => {
			
		customerController.getCustomer(session.customer).then((customer) => {
				
			var creditcard = createCreditCardObject(duplicate_body);

			creditCardController.storeCreditCard(creditcard, customer.creditcards).then((creditcard) => {
				
				productController.getProducts(duplicate_body['products']).then((products_to_purchase) => {
					
					campaignController.getHydratedCampaign(duplicate_body['campaign_id']).then((campaign) => {
							
						sessionController.validateProducts(products_to_purchase, session);
						
						campaignController.validateProducts(products_to_purchase, campaign);
						
						var amount = campaignController.productSum(products_to_purchase, campaign);
					
						loadBalancerController.process(campaign.loadbalancer, {customer: customer, creditcard: creditcard, amount: amount}).then((processor_response) => {
							
							transactionController.putTransaction({session: session, products: products_to_purchase, amount: amount}, processor_response).then((transaction) => {
								
								console.log(transaction);
								sessionController.updateSession(session).then((session) => {
								
									transaction.products = session.products;
								
									lr.issueResponse(200, {
										message: 'Success',
										results: transaction
									}, callback);
							
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


var createCreditCardObject = function(request_body){
	
	var creditcard = {
		ccnumber: request_body.ccnumber,
		expiration: request_body.ccexpiration,
		ccv: request_body.ccccv,
		name: request_body.name,
		address: request_body.address
	};
	
	return creditcard;
	
}