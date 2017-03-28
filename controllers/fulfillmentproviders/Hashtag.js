'use strict';
var fulfillmentProviderController = require('./FulfillmentProvider');

class HashtagController extends fulfillmentProviderController {

	constructor(){
		
		super();
		
	}
	
	triggerFulfillment(transaction_product){
		
		return new Promise((resolve, reject) => {
			
			resolve(this.stati.success);
			
		});
		
		
	}
        
}

module.exports = new HashtagController();