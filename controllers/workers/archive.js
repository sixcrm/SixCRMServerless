'use strict';
var _ = require("underscore");

var workerController = require('./worker.js');
var transactionController = require('../Transaction.js');
var rebillController = require('../Rebill.js');

class archiveController extends workerController {
	
	constructor(){
		super();
		this.messages = {
			success: 'ARCHIVED',
			skip:'SKIP'
		};
		this.archivefilters = {
			all:'ALL',
			noship:'NOSHIP'
		}
		
	}
	
	execute(event){
		
		return this.acquireRebill(event).then((rebill) => this.archive(rebill));
		
	}	
	
	confirmNoShip(rebill){
		
		var confirmed = true;
		
		return new Promise((resolve, reject) => {
			
			rebillController.getTransactions(rebill).then((transactions) => {
				
				var transaction_products = [];
				transactions.forEach((transaction) => {
					
					transaction_products.push(transactionController.getProducts(transaction));
					
				});
				
				Promise.all(transaction_products).then((transaction_products) => {
				
					transaction_products.forEach((transaction_product_collection) => {
						
						transaction_product_collection.forEach((a_transaction_product) => {
							
							if(a_transaction_product.product.ship == 'true'){

								confirmed = false;
								
								return;
								
							}
							
						});
						
					});
				
				}).then(() => {
				
					resolve(confirmed);
					
				});
				
			});
			
		});
		
	}
	
	archive(rebill){
		
		return new Promise((resolve, reject) => {
			
			if(_.has(process.env, "archivefilter")){
			
				switch(process.env.archivefilter){		
					
					case this.archivefilters.all:

						resolve(this.messages.success);
						break;
					
					case this.archivefilters.noship:
						
						this.confirmNoShip(rebill).then((confirmed) => {
								
							if(confirmed === true){
								resolve(this.messages.success);
							}else{
								resolve(this.messages.skip);
							}
							
						})
						
						break;
					
					default:
						
						reject(new Error('Unrecognized archive filter: '+process.env.archivefilter));	
					
				}
				
			}else{
				
				resolve(this.messages.success);
				
			}
			
			
		});
		
	}

}

module.exports = new archiveController();