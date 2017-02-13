'use strict';
//note not all of these are required...
const _ = require("underscore");
const request = require('request');
const querystring = require('querystring');

var timestamp = require('../../lib/timestamp.js');

var sessionController = require('../../controllers/Session.js');
var customerController = require('../../controllers/Customer.js');
var productController = require('../../controllers/Product.js');
var transactionController = require('../../controllers/Transaction.js');

class confirmOrderController {
	
	constructor(){
	
	}
	
	execute(event){
		
		return this.acquireQuerystring(event).then(this.validateInput).then(this.confirmOrder);
		
	}	
	
	acquireQuerystring(event){
		
		return new Promise((resolve, reject) => {
		
			var duplicate_querystring = event.queryStringParameters;
			
			try{
			
				duplicate_querystring = querystring.parse(duplicate_querystring);
			
			}catch(e){
				
				reject(e);
				
			}
			
			resolve(duplicate_querystring);
			
		});
		
	}
	
	validateInput(querystring){
		
		return new Promise((resolve, reject) => {
			
			if(!_.isObject(querystring) || !_.has(querystring, 'session_id')){
				throw new Error('The session_id must be set in the querystring.');
			}
		
			resolve(querystring);
			
		});
		
	}
	
	confirmOrder (querystring) {
		
		var promises = [];
		
		return sessionController.get(querystring['session_id']).then((session) => {
			
			if(session.completed == 'true'){ throw new Error('The specified session is already complete.'); }
			
			var getCustomer = sessionController.getCustomer(session);
			var getTransactions = sessionController.getTransactions(session);
			var getTransactionProducts = sessionController.getTransactionProducts(session);
			
			promises.push(getCustomer);
			promises.push(getTransactions);
			promises.push(getTransactionProducts);
			
			return Promise.all(promises).then((promises) => {

				var customer = promises[0];
				var transactions = promises[1];
				var transaction_products = promises[2];
			
				return sessionController.closeSession(session).then(() => {

					var results = {session: session, customer: customer, transactions: transactions, transaction_products: transaction_products};
					
					return results;
					
				});
				
			
			});
		
		});
				
	}
	
}

module.exports = new confirmOrderController();