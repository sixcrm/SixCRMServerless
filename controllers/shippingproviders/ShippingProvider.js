'use strict';
var USPSController = require('./USPSController.js');
class shippingProviderController {

	constructor(){

	}
	
	getStatus(provider, tracking_number){
		
		switch(provider){
		
			case 'usps':
			
				return USPSController.getStatus(tracking_number);
				
				break;
				
			default:
				throw new Error('Unknown shipping provider: '+provider);
				break;
		}	
		
	}
        
}

module.exports = new shippingProviderController();