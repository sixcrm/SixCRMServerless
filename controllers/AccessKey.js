'use strict';
const _ = require('underscore');
var dynamoutilities = require('../lib/dynamodb-utilities.js');

class AccessKeyController {

	constructor(){
	
	}
	
	getAccessKey(access_key){
		
		return new Promise((resolve, reject) => {
				
			dynamoutilities.queryRecords(process.env.access_keys_table, 'access_key = :access_keyv', {':access_keyv': access_key}, 'access_key-index', (error, data) => {
				
				if(_.isError(error)){ reject(error);}
				
				if(_.isArray(data)){
					
					if(data.length == 1){
					
						resolve(data[0]);
					
					}else{
						
						if(data.length > 1){
							reject(new Error('More than one record returned for customer ID.'));
						}else{
							
							resolve([]);
							
						}
					
					}
					
				}
	
			});
			
        });
		
	}
	
}

module.exports = new AccessKeyController();
