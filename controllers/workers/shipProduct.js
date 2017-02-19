'use strict';
var AWS = require("aws-sdk");
const fs = require('fs');
const validator = require('validator');
const Validator = require('jsonschema').Validator;
const v = new Validator();
var _ = require("underscore");

var rebillController = require('../../controllers/Rebill.js');
var transactionController = require('../../controllers/Transaction.js');
var shippingReceiptController = require('../../controllers/ShippingReceipt.js');
var fulfillmentTriggerController = require('../../controllers/fulfillmentproviders/FulfillmentTrigger.js');

class shipProductController {
	
	constructor(){
	
	}
	
	execute(event){
		
		return this.acquireRebill(event)
			.then((event) => this.validateRebill(event))
			.then((event) => this.shipProducts(event));
		
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
	
	issueShippingReceipt(fulfillment_response, transaction_product, transaction){
	
		return new Promise((resolve, reject) => {
			
			var promises = []
			promises.push(transactionController.get(transaction.id));
			promises.push(shippingReceiptController.create(shippingReceiptController.createShippingReceiptObject({status:'pending'})));
			
			Promise.all(promises).then((promises) => {
			
				var raw_transaction = promises[0];
				var new_shipping_receipt = promises[1];
				
				var found = false;
				for(var i=0; i< raw_transaction.products.length; i++){
					
					if(!_.has(raw_transaction, 'shippingreceipt')){
						
						if(raw_transaction.products[i].product == transaction_product.product.id && raw_transaction.products[i].amount == transaction_product.amount){
					
							found = true;
					
							raw_transaction.products[i].shippingreceipt = new_shipping_receipt.id;
							
							return transactionController.update(raw_transaction).then((updated_transaction) => {
								
								return updated_transaction
								
							});
									
						}
					
					}
				
				}
				
				if(found == false){
					throw new Error('Unable to re-acquire transaction');
				}

			}).then((updated_transaction) => {
				resolve(updated_transaction);
			}).catch((error) => {
				reject(error);
			});	
			
		});
		
	}
	
	executeFulfillment(transaction_product, transaction){
		
		return new Promise((resolve, reject) => {
				
			if(transaction_product.product.ship == 'true'){
			
				if(!_.has(transaction_product, 'shippingreceipt')){
					 
					fulfillmentTriggerController.triggerFulfillment(transaction_product).then((fulfillment_response) => {
						
						if(fulfillment_response == 'NOTIFIED'){
		
							this.issueShippingReceipt(fulfillment_response, transaction_product, transaction).then(() => {
							
								resolve(fulfillment_response);	
							
							});
							
						}else{
							
							resolve(fulfillment_response);
							
						}
						
					});
					
				}else{
					
					resolve('NOTIFIED');
					
				}
				
			}else{
				
				resolve("NOSHIP");
				
			}
			
		});
		
	}
	
	processTransaction(transaction){
		
		return new Promise((resolve, reject) => {
			
			if(_.has(transaction, 'products')){
				
				var transaction_products = [];
				transaction.products.map((transaction_product) => {
					
					var getTransactionProduct = transactionController.getTransactionProduct(transaction_product);
					transaction_products.push(getTransactionProduct);
				
				});
						
				Promise.all(transaction_products).then((transaction_products) => {
					
					var fulfillment_triggers = [];
				
					transaction_products.forEach((transaction_product) => {
					
						if(transaction_product.product.ship == 'true'){					
								
							var transactionProductExecuteFulfillment = this.executeFulfillment(transaction_product, transaction);
							fulfillment_triggers.push(transactionProductExecuteFulfillment);
						
						}
					
					});
				
					if(fulfillment_triggers.length > 0){
				
						return Promise.all(fulfillment_triggers).then((fulfillment_trigger_responses) => {
					
							fulfillment_trigger_responses.map((fulfillment_trigger_response) => {
							
								if(fulfillment_trigger_response != 'NOTIFIED'){
							
									return fulfillment_trigger_response;
							
								}
							
							});
						
							return 'NOTIFIED';
					
						}).then((result_message) => {
						
							return result_message;
					
						});
					
					}else{
					
						return 'NOSHIP';
					
					}
					
				}).then((response) => {
					resolve(response);
				});
				
			
				
			}else{
				
				reject(new Error('No product in transaction?'));
				
			}
			
		});
		
	}
	
	//Technical Debt:  Introduce fulfillment delay
	//Technical Debt: Do not attempt to fulfillment provider a second time (aka shipping receipt already exists) -  Does this still plaugue us?
	shipProducts(rebill) {
		
		var promises = [];
		var getTransactions = rebillController.getTransactions(rebill);
		promises.push(getTransactions);
		
		var noship = true;
		
		return Promise.all(promises).then((promises) => {
			
			var transactions = promises[0];
			
			var process_transactions = [];		
			transactions.map((transaction) => {
					
				process_transactions.push(this.processTransaction(transaction));
		
			});
			
			return Promise.all(process_transactions).then((process_transactions) => {
				
				var response = 'NOTIFIED';
				process_transactions.map((processed_transaction) => {
					if(processed_transaction != 'NOTIFIED'){
						response = processed_transaction;
					}
				});
				return response;
				
			});

		
		});
				
	}
	
}

module.exports = new shipProductController();