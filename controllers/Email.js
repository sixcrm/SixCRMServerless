'use strict';
const _ = require('underscore');
const uuidV4 = require('uuid/v4');

var dynamoutilities = require('../lib/dynamodb-utilities.js');
var SMTPProviderController = require('./SMTPProvider.js');
var entityController = require('./Entity.js');

class emailController extends entityController {

	constructor(){
		super(process.env.emails_keys_table, 'email');
		this.table_name = process.env.emails_table;
		this.descriptive_name = 'email';
	}
	
	getSMTPProvider(email){
		
		return SMTPProviderController.get(email.smtp_provider);
		
	}
	
}

module.exports = new emailController();
