'use strict';
const _ = require('underscore');

var dynamoutilities = require('../lib/dynamodb-utilities.js');

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
		
		return this.listBySecondaryIndex('user', user, 'user-index');
		
	}
	
	getACLByAccount(account){
		
		return this.listBySecondaryIndex('account', account, 'account-index');
		
	}
	
	getUser(useracl){
		
		//necessary because of embedded embeds (etc)
		let userController = require('./User.js');
		
		return userController.get(useracl.user);
		
	}
	
	getAccount(useracl){
		
		return accountController.get(useracl.account);
		
	}
	
	getRole(useracl){
		
		return roleController.get(useracl.role);
	
	}
        
}

module.exports = new userACLController();