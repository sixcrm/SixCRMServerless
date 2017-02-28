'use strict';
const _ = require('underscore');

var dynamoutilities = require('../lib/dynamodb-utilities.js');

var accountController = require('./Account.js');
var roleController = require('./Role.js');
var accessKeyController = require('./AccessKey.js');
var entityController = require('./Entity.js');

class userController extends entityController {

	constructor(){
		super(process.env.users_table, 'user');
		this.table_name = process.env.users_table;
		this.descriptive_name = 'user';
	}
	
	getUserByAccessKeyId(access_key_id){
		return this.getBySecondaryIndex('access_key_id', access_key_id, 'access_key_id-index');
	}
	
	getACL(user){
		
		return user.acl.map((useracl_object) => {
			
			return useracl_object;	
			
			/*
			return {
				"account": useracl_object.account,
				"role": useracl_object.role,
				"signature": useracl_object.signature
			}
			*/
			
		});	
		
	}
	
	getAccount(id){
		
		return accountController.get(id);
		
	}
	
	getRole(id){
		
		return roleController.get(id);
		
	}
	
	getAccessKey(id){
		return accessKeyController.get(id);
	}
	
	getAccessKeyByKey(id){
		return accessKeyController.getAccessKeyByKey(id);
	}
	
	getUserByEmail(email){
		return this.getBySecondaryIndex('email', email, 'email-index');
	}
	
	getAddress(user){
		
		if(_.has(user, "address")){
			
			return user.address;
			
		}else{
			return null;
		}
		
	}
        
}

module.exports = new userController();