'use strict';
var USPSController = require('./USPS.js');
class shippingStatusController {

	constructor(){

	}
	
	isDelivered(provider, tracking_number){
	
		return new Promise((resolve, reject) => {
		
			switch(provider){
		
				case 'usps':
			
					USPSController.isDelivered(tracking_number).then((delivered) => {
						
						if(delivered == true){
							return resolve(true);
						}else{
							return resolve(false);
						}
					
					});
				
					break;
					
				default:
					reject(new Error('Unknown shipping provider: '+provider));
					break;
			}	
			
		});
		
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

module.exports = new shippingStatusController();