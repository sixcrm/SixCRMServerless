'use strict';
const _ = require('underscore');

var dynamoutilities = require('../lib/dynamodb-utilities.js');

var accessKeyController = require('./AccessKey.js');

class userController {

	constructor(){
	
	}
	
	getUserByAccessKeyId(access_key_id){
		
		var controller_instance = this;
		
		return new Promise((resolve, reject) => {
			
			dynamoutilities.queryRecords(process.env.users_table, 'access_key_id = :access_key_idv', {':access_key_idv': access_key_id}, 'access_key_id-index', (error, data) => {
				
				if(_.isError(error)){ reject(error);}
				
				if(_.isObject(data) && _.isArray(data)){
					
					if(data.length == 1){
											
						resolve(data[0]);
						
					}else{
						
						if(data.length > 1){
						
							reject(new Error('Multiple users returned where one should be returned.'));
							
						}else{
						
							resolve([]);
							
						}
						
					}
					
				}
				
			});
			
		});
		
	}
	
	getAccessKeyByID(id){
		return accessKeyController.getAccessKeyByID(id);
	}
	
	getAccessKey(id){
		return accessKeyController.getAccessKey(id);
	}
	
	getUser(id){
		
		var controller_instance = this;
		
		return new Promise((resolve, reject) => {
				
			dynamoutilities.queryRecords(process.env.users_table, 'id = :idv', {':idv': id}, null, (error, data) => {
				
				if(_.isError(error)){ reject(error);}
				
				if(_.isObject(data) && _.isArray(data)){
					
					if(data.length == 1){
											
						resolve(data[0]);
						
					}else{
						
						if(data.length > 1){
						
							reject(new Error('Multiple users returned where one should be returned.'));
							
						}else{
						
							resolve([]);
							
						}
						
					}
					
				}
				
			});
			
        });
        
    }
        
}

module.exports = new userController();