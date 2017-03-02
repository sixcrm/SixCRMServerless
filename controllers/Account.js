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
	
}

module.exports = new accountController();