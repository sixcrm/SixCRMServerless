'use strict';
var AWS = require("aws-sdk");
const fs = require('fs');
const validator = require('validator');
const Validator = require('jsonschema').Validator;
const v = new Validator();
var _ = require("underscore");

var lr = require('../../lib/lambda-response.js');
var rebillController = require('../../controllers/Rebill.js');
var transactionController = require('../../controllers/Transaction.js');
var shippingStatusController = require('../../controllers/shippingproviders/ShippingStatus.js');

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
		
		var transaction_products = [];
		
		transactions.map((transaction) => {
			
			if(_.has(transaction, 'products')){
				
				transaction.products.map((transaction_product) => {
					  
					var getTransactionProduct = transactionController.getTransactionProduct(transaction_product);
					
					transaction_products.push(getTransactionProduct);

				});	
				
			}
		
		});
				
		return Promise.all(transaction_products).then((transaction_products) => {
			
			var shipping_provider_stati = [];	
			transaction_products.map((transaction_product) => {
				
				if(_.has(transaction_product, "shippingreceipt") && _.has(transaction_product.shippingreceipt, "trackingnumber")){
										
					//Technical Debt:  This is hard-coded to USPS, that may need to change
					var getShippingProviderStatus = shippingStatusController.getStatus('usps', transaction_product.shippingreceipt.trackingnumber);
					shipping_provider_stati.push(getShippingProviderStatus);
					
				}
			
			});
			
			return Promise.all(shipping_provider_stati).then((shipping_provider_stati) => {
				
				shipping_provider_stati.map((shipping_provider_status) => {
					
					if(_.has(shipping_provider_status, "parsed_status")){
						
						if(shipping_provider_status !== 'DELIVERED'){
							
							delivered = shipping_provider_status;
							
							return;
							
						}
						
					}
					
				});
				
			});
		
		}).then(() => {
			
			return delivered;
			
		});
		
	}).then((delivered) => {
		
		if(delivered !== true){
			
			lr.issueResponse(200, {
				message: delivered.parsed_status
			}, callback);
			
		}else{
			
			lr.issueResponse(200, {
				message: event
			}, callback);
			
		}
		
		
		
	});

}