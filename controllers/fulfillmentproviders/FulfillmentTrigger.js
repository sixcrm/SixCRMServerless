'use strict';
var _ = require('underscore');
var HashtagController = require('./Hashtag.js');
var fulfillmentProviderController = require('../FulfillmentProvider.js');

class fulfillmentTriggerController {

	constructor(){

	}
	
	triggerFulfillment(transaction_product){
		
		return this.getFulfillmentProvider(transaction_product).then((transaction_product) => this.executeFulfillment(transaction_product));
		
	}
	
	executeFulfillment(transaction_product){
		
		return new Promise((resolve, reject) => {
			
			if(!_.has(transaction_product.product, "fulfillment_provider") || !_.has(transaction_product.product.fulfillment_provider, "name")){
				
				reject(new Error('Unable to identify fulfillment provider associated with the transaction_product.'));
				
			}
			
			switch(transaction_product.product.fulfillment_provider.provider){
				
				case 'HASHTAG':
			
					HashtagController.triggerFulfillment(transaction_product).then((fulfillment_response) => {
						
						resolve(fulfillment_response);
						
					});
					
					break;
				
				default:
					
					reject(new Error('Unknown fulfillment provider: '+provider));
					
					break;
					
			}	
			
		});
		
	}
	
	//Technical Debt:  It'd be better if the object that was coming through the pipe was hydrated...
	getFulfillmentProvider(transaction_product){

		return new Promise((resolve, reject) => {
			
			fulfillmentProviderController.get(transaction_product.product.fulfillment_provider).then((fulfillment_provider) => {
				
				transaction_product.product.fulfillment_provider = fulfillment_provider;
				
				resolve(transaction_product);
				
			}).catch(reject);

		});
		
	}
        
}

module.exports = new fulfillmentTriggerController();