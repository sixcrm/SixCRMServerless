'use strict';
const _ = require('underscore');
const validator = require('validator');

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
	
	/*
	invite(user){
	
		return new Promise((resolve, reject) => {
			
			this.validate(user, 'userinvite').then((validated) => {
				
				if(!validator.isEmail(user.email)){
					reject(new Error('Invalid user email address.'));
				}
				
				var promises = [];
				promises.push(this.getUserByEmail(user.email));
				promises.push(accountController.get(user.account));
				promises.push(roleController.get(user.role));
				
				Promise.all(promises).then((promises) => {
				
					let invited_user = promises[0];
					let account = promises[1];
					let role = promises[2];
					
					if(!_.has(account, 'id')){ reject(new Error('Invalid account.')); }
					//is the account that we are operating against 
					
					if(!_.has(role, 'id')){ reject(new Error('Invalid role.')); }
					//is not the owner
					//role is not higher than the inviting user's role
					
					if(_.has(invited_user, 'id')){
						
						//make sure that the user isn't already on the account with the same role.
						
					}
					
					//create link with signature
					//respond with link	
					
				});
				
			}).catch((error) => {
				reject(error);
			});
			
		});
		
	}
	*/
	
	getUserByAccessKeyId(access_key_id){
		return this.getBySecondaryIndex('access_key_id', access_key_id, 'access_key_id-index');
	}
	
	getACL(user){
		
		if(!_.has(user.acl)){ return null; }
		
		return user.acl.map((useracl_object) => {
			
			return useracl_object;	
			
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