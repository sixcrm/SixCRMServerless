'use strict';
var _ = require("underscore");

var rebillController = require('../../controllers/Rebill.js');
var transactionController = require('../../controllers/Transaction.js');
var shippingReceiptController = require('../../controllers/ShippingReceipt.js');
var workerController = require('./worker.js');
var util = require('util');

class confirmShippedController extends workerController {
	
	constructor(){
		super();
		this.messages = {
			shipped: 'SHIPPED',
			notshipped: 'NOTSHIPPED'
		};
	}
	
	execute(event){
		
		return this.acquireRebill(event).then(this.confirmShipped);
		
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
						// We only have the ID here, so this fails
						if(!_.has(transaction_product, "shippingreceipt") || !_.has(transaction_product.shippingreceipt,'trackingnumber')){
							shipped = this.messages.notshipped;
							
						}
					
					}
			
				});
		
			}).then(() => {
				
				if(shipped == 'true'){
					shipped = this.messages.shipped;
				}
				return shipped;
			
			});
		
		});
				
	}
	
}

module.exports = new confirmShippedController();