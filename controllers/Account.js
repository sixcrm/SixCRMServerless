'use strict';
const _ = require('underscore');
var dynamoutilities = require('../lib/dynamodb-utilities.js');
var entityController = require('./Entity.js');

class accountController extends entityController {

	constructor(){
		super(process.env.accounts_table, 'account');
		this.table_name = process.env.accounts_table;
		this.descriptive_name = 'account';  
	}
	
	getMasterAccount(){
	
		return new Promise((resolve, reject) => {
		
			let master_account = {
				"id":"*",
				"name": "Master Account",
				"active":"true"
			};
			
			resolve(master_account);
			
		});
		
	}
	
}

module.exports = new accountController();