'use strict';
const _ = require("underscore");
const fs = require('fs');
const validator = require('validator');
const Validator = require('jsonschema').Validator;
const v = new Validator();
const request = require('request');
const querystring = require('querystring');

var lr = require('../../lib/lambda-response.js');
var timestamp = require('../../lib/timestamp.js');

var sessionController = require('../../controllers/Session.js');
var customerController = require('../../controllers/Customer.js');
var productController = require('../../controllers/Product.js');
var transactionController = require('../../controllers/Transaction.js');

module.exports.confirmorder = (event, context, callback) => {
	
	var duplicate_querystring = event.queryStringParameters;
	
	if(_.isString(duplicate_querystring)){
	
		try{
			duplicate_querystring = querystring.parse(duplicate_querystring);	
		}catch(e){
			
			lr.issueError(new Error('Could not parse query string.'), 500, event, error, callback);
		}
		
	}else{
	
		lr.issueError(new Error('Request querystring is an unexpected format.'), 500, event, error, callback);
	
	}
	
	var schema;
	
	try{
		schema = JSON.parse(fs.readFileSync('./endpoints/confirmorder/schema/confirmorder.json','utf8'));
	} catch(e){
		lr.issueError(new Error('Unable to load the confirm order request schema for validation.'), 500, event, error, callback);
	}
			
	var validation;
	
	try{
		var v = new Validator();
		validation = v.validate(duplicate_querystring, schema);
	}catch(e){
		lambda_response.body = JSON.stringify(
			{message: e.message}
		);
		callback(null, lambda_response);
	}
	
	sessionController.getSession(duplicate_querystring['session_id']).then((session) => {

		if(session.completed == 'true'){ throw new Error('The specified session is already complete.');}
		
		customerController.getCustomer(session.customer).then((customer) => {
				
			productController.getProducts(session.products).then((products) => {
				
				sessionController.getTransactions(session.id).then((transactions) => {
						
					sessionController.closeSession(session).then(() => {
							
						var results = {session: session, customer: customer, products: products, transactions: transactions};
					
						return lr.issueResponse(200, {
							message: 'Success',
							results: results
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
			
		}).catch((error) => {
			lr.issueError(error, 500, event, error, callback);
		});
	
	}).catch((error) => {
		lr.issueError(error, 500, event, error, callback);
	});
				
};