'use strict';
const _ = require('underscore');

var dynamoutilities = require('../lib/dynamodb-utilities.js');
const du = require('../lib/debug-utilities.js');

var accountController = require('./Account.js');
var roleController = require('./Role.js');
//Technical Debt: This is null when the UserACLController is included from the context of the UserController
let userController = require('./User.js');
var entityController = require('./Entity.js');

class userACLController extends entityController {

	constructor(){
		super(process.env.users_table, 'useracl');
		this.table_name = process.env.user_acls_table;
		this.descriptive_name = 'useracl';
	}
	
	//this is called specifically from the UserController.  Hence the partial hydration...
	getPartiallyHydratedACLObject(useracl){
		
		var controller_instance = this;
		
		return new Promise((resolve, reject) => {
			
			let promises = [];
			
			promises.push(this.getAccount(useracl));
			promises.push(this.getRole(useracl));
			
			return Promise.all(promises).then(promises => {
				
				useracl.account = promises[0];
				useracl.role = promises[1];
				
				return resolve(useracl);
				
			})
			
		});
		
	}
	
	getACLByUser(user){
		
		du.debug('getACLByUser', user);
		return this.listBySecondaryIndex('user', user, 'user-index');
		
	}
	
	getACLByAccount(account){
		du.debug('getACLByAccount');
		return this.listBySecondaryIndex('account', account, 'account-index');
		
	}
	
	getUser(useracl){
			
		du.debug('getUser', useracl);
		
		if(_.has(useracl, 'user') && _.has(useracl.user, 'id')){
			return useracl.user;
		}
		
		//necessary because of embedded embeds (etc)
		let userController = require('./User.js');
		
		return userController.get(useracl.user);
		
	}
	
	getAccount(useracl){
		
		if(_.has(useracl, 'account') && _.has(useracl.account, 'id')){
			return useracl.account;
		}
		
		return accountController.get(useracl.account);
		
	}
	
	getRole(useracl){
		
		du.debug('getRole');
		
		if(_.has(useracl, 'role') && _.has(useracl.role, 'id')){
			return useracl.role;
		}
		
		return roleController.get(useracl.role);
	
	}
	
	assure(useracl){
		
		du.highlight('Assure UserACL', useracl);
		
		return new Promise((resolve, reject) => {
			
			this.getACLByUser(useracl.user).then((acl) => {
				
				let identified_acl = false;
				
				if(!_.isNull(acl)){
					acl.forEach((acl_object) => {
					
						if(acl_object.account == useracl.account){
						
							identified_acl = acl_object;
							return true;
					
						}					
					
					});		
				}
				
				if(_.has(identified_acl, 'id')){
					du.highlight('Identified ACL:', identified_acl);
					return resolve(identified_acl);
				}else{
					du.highlight('Unable to identify ACL');
					this.create(useracl).then((acl) => {
						du.highlight('ACL created: ', acl);
						return resolve(acl);
					}).catch((error) => {
						return reject(error);
					});
					
				}
				
			}).catch((error) => {
				
				return reject(error);
				
			});
		
		});

	}
        
}

module.exports = new userACLController();