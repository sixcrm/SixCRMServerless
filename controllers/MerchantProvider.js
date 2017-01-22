'use strict';
const _ = require('underscore');

var dynamoutilities = require('../lib/dynamodb-utilities.js');

class merchantProviderController {

	constructor(){
	
	}
	
	getMerchantProvider(id){
		
		var controller_instance = this;
		
		return new Promise((resolve, reject) => {
				
			dynamoutilities.queryRecords(process.env.merchant_providers_table, 'id = :idv', {':idv': id}, null, (error, data) => {
				
				if(_.isError(error)){ reject(error);}
				
				if(_.isObject(data) && _.isArray(data)){
					
					if(data.length == 1){
											
						resolve(data[0]);
						
					}else{
						
						if(data.length > 1){
						
							reject(new Error('Multiple merchant providers returned where one should be returned.'));
							
						}else{
						
							resolve([]);
							
						}
						
					}
					
				}
				
			});
			
        });
        
    }
        
}

module.exports = new merchantProviderController();