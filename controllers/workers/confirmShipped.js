'use strict';
var AWS = require("aws-sdk");
const fs = require('fs');
const validator = require('validator');
const Validator = require('jsonschema').Validator;
const v = new Validator();
var _ = require("underscore");

var rebillController = require('../../controllers/Rebill.js');
var transactionController = require('../../controllers/Transaction.js');

class confirmShippedController {
	
	constructor(){
	
	}
	
	execute(event){
		
		return this.acquireRebill(event).then(this.validateRebill).then(this.confirmShipped);
		
	}	
	
	acquireRebill(event){
		
		return new Promise((resolve, reject) => {
		
			var id;
			if(_.has(event, 'id')){
				id = event.id;
			}else{
				id = event;
			}
			
			rebillController.get(id).then((rebill) => {
				resolve(rebill);
			}).catch((error) => {
				reject(error);
			});
			
		});
		
	}	
	
	validateRebill(rebill){
		
		return new Promise((resolve, reject) => {
			
			try{

				var rebill_schema = require('../../model/rebill.json');

			} catch(e){
		
				reject(new Error('Unable to load validation schemas.'));

			}
	
			var validation;

			try{
				var v = new Validator();
				validation = v.validate(rebill, rebill_schema);
			}catch(e){
				reject(e);
			}
	
			if(_.has(validation, "errors") && _.isArray(validation.errors) && validation.errors.length > 0){
		
				var error = {
					message: 'One or more validation errors occurred.',
					issues: validation.errors.map((e) => { return e.message; })
				};
		
				reject(error);

			}
	
			resolve(rebill);
			
		});
		
	}
	
	confirmShipped(rebill) {
		
		var promises = [];
		var getTransactions = rebillController.getTransactions(rebill);
		promises.push(getTransactions);
	
		var shipped = true;
	
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
					
					if(transaction_product.product.ship == 'true'){
						
						if(!_.has(transaction_product, "shipping_receipt") || !_.has(transaction_product.shipping_receipt,'trackingnumber')){
					
							shipped = 'NOTSHIPPED';
							
						}
					
					}
					
			
				});
		
			}).then(() => {
				
				if(shipped == 'true'){
					shipped = 'SHIPPED';
				}
				return shipped;
			
			});
		
		});
				
	}
	
}

module.exports = new confirmShippedController();