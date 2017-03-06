'use strict';
const _ = require('underscore');
const validator = require('validator');

var dynamoutilities = require('../lib/dynamodb-utilities.js');

var accountController = require('./Account.js');
var roleController = require('./Role.js');
var accessKeyController = require('./AccessKey.js');
let userACLController = require('./UserACL.js');
var entityController = require('./Entity.js');

class userController extends entityController {

	constructor(){
		super(process.env.users_table, 'user');
		this.table_name = process.env.users_table;
		this.descriptive_name = 'user';
	}
	
	getHydrated(id){
		
		var controller_instance = this;
		
		return new Promise((resolve, reject) => {
			
			this.get(id).then((user) => {
				
				if(_.has(user, 'id')){
				
					this.getACLPartiallyHydrated(user).then((acl) => {
						
						user.acl = acl;
					
						resolve(user);
						
					}).catch((error) => {
					
						reject(error);
						
					});
				
				}else{
					
					resolve(null);
										
				}
			
			}).catch((error) => {
			
				return reject(error);
				
			});
			
		});
		
	}
	
	getACL(user){
		
		return userACLController.getACLByUser(user.id);
		
	}
	
	getACLPartiallyHydrated(user){
		
		return new Promise((resolve, reject) => {
		
			var acls = [];
			
			console.log('UserID: '+user.id);
			
			userACLController.listBySecondaryIndex('user', user.id, 'user-index').then((acls) => {
				
				console.log(acls);
				
				if(_.isNull(acls)){
					resolve(null);
				}
					
				let acl_promises = acls.map(acl => userACLController.getPartiallyHydratedACLObject(acl));
				
				Promise.all(acl_promises).then((acl_promises) => {

					resolve(acl_promises);
					
				}).catch((error) => {

					reject(error);
				});
				
			});
			
		});
		
	}
	
	getAccount(id){
		
		if(id == '*'){ 
			return accountController.getMasterAccount(); 
		}else{
			return accountController.get(id);
		}
		
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
	
	getUserByAccessKeyId(access_key_id){
	
		return this.getBySecondaryIndex('access_key_id', access_key_id, 'access_key_id-index');
		
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
	        
}

module.exports = new userController();