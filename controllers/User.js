'use strict';
const _ = require('underscore');
const validator = require('validator');
const uuidV4 = require('uuid/v4');

const slackutilities = require('../lib/slack-utilities.js');
const dynamoutilities = require('../lib/dynamodb-utilities.js');
const du = require('../lib/debug-utilities.js');

const accountController = require('./Account.js');
const roleController = require('./Role.js');
const accessKeyController = require('./AccessKey.js');
const userACLController = require('./UserACL.js');
const entityController = require('./Entity.js');

class userController extends entityController {

	constructor(){
		super(process.env.users_table, 'user');
		this.table_name = process.env.users_table;
		this.descriptive_name = 'user';
	}
	
	introspection(){
		
		du.debug('Introspection');
		
		return new Promise((resolve, reject) => {
			
			if(_.has(global, 'user') && _.has(global.user, 'id')){
			
				du.debug('Global User:', global.user);
				
				return resolve(global.user);
				
			}else{
			
				du.debug('No Global User');
				
				return resolve(null);
				
			}
			
		});
		
	}
	
	getHydrated(id){
		
		var controller_instance = this;
		
		return new Promise((resolve, reject) => {
			
			this.get(id).then((user) => {
				
				du.debug('Prehydrated User:', user);
				
				if(_.has(user, 'id')){
				
					this.getACLPartiallyHydrated(user).then((acl) => {
						
						du.debug('Partially hydrated User ACL object:', acl);
							
						user.acl = acl;
					
						return resolve(user);
						
					}).catch((error) => {
					
						return reject(error);
						
					});
				
				}else{
					
					return resolve(null);
										
				}
			
			}).catch((error) => {
			
				return reject(error);
				
			});
			
		});
		
	}
	
	getACL(user){
		
		if(_.has(user, 'acl') && _.isArray(user.acl)){
			return user.acl;
		}
		
		return userACLController.getACLByUser(user.id);
		
	}
	
	getACLPartiallyHydrated(user){
		
		return new Promise((resolve, reject) => {
		
			var acls = [];
			
			du.debug('User: ', user.id);
			
			userACLController.listBySecondaryIndex('user', user.id, 'user-index').then((acls) => {
				
				du.debug('ACLs: ', acls);
				
				if(_.isNull(acls)){
					return resolve(null);
				}
				
				du.debug('ACLs: ', acls);
				
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
	
	getAddress(user){
		
		if(_.has(user, "address")){
			
			return user.address;
			
		}else{
			return null;
		}
		
	}
	
	createProfile(email){
		
		return new Promise((resolve, reject) => {
		
			this.disableACLs();
			
			let account_id = uuidV4();
			
			let promises = [];
			promises.push(accountController.create({id: account_id,name: email+'-pending-name', active: 'false'}));
			promises.push(this.create({id:email, name:email, active:"false"}));
			promises.push(roleController.get('cae614de-ce8a-40b9-8137-3d3bdff78039'));
			
			Promise.all(promises).then((promises) => {
				
				let account = promises[0];
				let user = promises[1];
				let role = promises[2];
				
				if(!_.has(account, 'id') || !_.has(user, 'id') || !_.has(role, 'id')){
					reject(new Error('Unable to create new profile'));
				}
				
				du.debug('User', user);
				du.debug('Role', role);
				du.debug('Account', account);
				
				let acl_object = {
					user: user.id,
					account: account_id,
					role: role.id
				};
				
				du.debug('ACL object to create:', acl_object);
				
				userACLController.create(acl_object).then((acl) => {
					
					
					acl.account = account;
					acl.role = role;
					
					du.debug(acl);
					
					this.enableACLs();
							
					user.acl = [acl];
					
					
					resolve(user);
					
				}).catch((error) => {
					
					du.warning(error);
					reject(error);
					
				});
	
			}).catch((error) => {
				
				reject(error);
				
			});
			
		});
		
	}
	
	createStrict(user){
		
		du.debug('Create User Strict');
		du.debug('Arguments:', user);
			
		return new Promise((resolve, reject) => {
			
			du.debug('global user', global.user);
			if(_.has(global, 'user') && _.has(global.user, 'id')){

				if(global.user.id == user.id){
					
					this.disableACLs();
					
					this.create(user).then((user) => {
						
						this.enableACLs();
						
						resolve(user);
						
					}).catch((error) => {
					
						reject(error);
					
					});
					
				}
			
			}
			
		});
		
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
				//refactored
				promises.push(this.get(user.email));
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