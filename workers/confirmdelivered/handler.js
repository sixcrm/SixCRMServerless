'use strict';
var AWS = require("aws-sdk");
const fs = require('fs');
const validator = require('validator');
const Validator = require('jsonschema').Validator;
const v = new Validator();
var _ = require("underscore");

var lr = require('../../lib/lambda-response.js');
var rebillController = require('../../controllers/Rebill.js');

module.exports.confirmdelivered = (event, context, callback) => {
	
	try{

		var rebill_schema = require('../../model/rebill.json');

	} catch(e){
		
		callback(new Error('Unable to load validation schemas.'), null);

	}
	
	var validation;
	var params = JSON.parse(JSON.stringify(event));

	try{
		var v = new Validator();
		validation = v.validate(event, rebill_schema);
	}catch(e){
		console.log(e);
		callback(new Error('Unable to instantiate validator.'), null);
	}
	
	if(_.has(validation, "errors") && _.isArray(validation.errors) && validation.errors.length > 0){
		
		var error = {
			message: 'One or more validation errors occurred.',
			issues: validation.errors.map((e) => { return e.message; })
		};
		
		callback(error, null);

	}
	
	var promises = [];
	var getTransactions = rebillController.getTransactions(event);
	promises.push(getTransactions);
	
	var delivered = true;
	
	return Promise.all(promises).then((promises) => {
		
		var transactions = promises[0];

		transactions.map((transaction) => {
			
			if(_.has(transaction, 'products')){
				
				return Promise.all(transaction.products.map(transactionController.getTransactionProduct)).then((transaction_products) => {
				
					return Promise.all(transaction_products.map((transaction_product) => {
						
						return new Promise((resolve, reject) => {
							
							//check if tracking number on shipping receipt has been delivered.
							//if not delivered, mark delivered false...
							
						});
						
					});
				
				});
						
				
			}else{
				
				//a rebill that has a transaction without products??
				
			}
			
		});
		
		return true;
		
	}).then((something) => {
		
		lr.issueResponse(200, {
			message: 'Success'
		}, callback);
		
	}).catch((error) => {
	
		 lr.issueResponse(500, {
			message: 'Success'
		}, callback);
		
	});        

}