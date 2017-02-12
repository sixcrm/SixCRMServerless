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
	
	if(!_.isObject(duplicate_querystring)){
	
		if(_.isString(duplicate_querystring)){
	
			try{
				duplicate_querystring = querystring.parse(duplicate_querystring);	
			}catch(error){
			
				lr.issueError(error, 500, event, error, callback);
			}
		
		}else{
		
			var error = new Error('Request querystring is an unexpected format.')
	
			lr.issueError(error, 500, event, error, callback);
	
		}
		
	}
	
	var schema;
	
	try{
		schema = JSON.parse(fs.readFileSync('./endpoints/confirmorder/schema/confirmorder.json','utf8'));
	} catch(error){
		lr.issueError(error, 500, event, error, callback);
	}
			
	var validation;
	
	try{
		var v = new Validator();
		validation = v.validate(duplicate_querystring, schema);
	}catch(error){
		lr.issueError(error, 500, event, error, callback);
	}
	
	sessionController.get(duplicate_querystring['session_id']).then((session) => {
		
		if(!_.isObject(session) || !_.has(session, "id")){
			throw new Error('The specified session does not exist.');
		}

		if(session.completed == 'true'){ throw new Error('The specified session is already complete.');}

		sessionController.getCustomer(session).then((customer) => {
		
			sessionController.getTransactionProducts(session).then((transaction_products) => {

				sessionController.getTransactions(session).then((transactions) => {

					sessionController.closeSession(session).then(() => {

						var results = {session: session, customer: customer, transactions: transactions, transaction_products: transaction_products};
	
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