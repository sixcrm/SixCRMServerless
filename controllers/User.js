'use strict';
const _ = require('underscore');

var dynamoutilities = require('../lib/dynamodb-utilities.js');

var accessKeyController = require('./AccessKey.js');
var entityController = require('./Entity.js');

class userController extends entityController {

	constructor(){
		super(process.env.users_table, 'user');
		this.table_name = process.env.users_table;
		this.descriptive_name = 'user';
	}
	
	//shouldn't this be in the users table?
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
	
	//what is this?
	getAccessKeyByID(id){
		return accessKeyController.get(id);
	}
	
	//what is this?
	getAccessKey(id){
		return accessKeyController.getAccessKey(id);
	}
        
}

module.exports = new userController();