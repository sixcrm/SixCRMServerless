'use strict';
const _ = require('underscore');

var dynamoutilities = require('../lib/dynamodb-utilities.js');
var entityController = require('./Entity.js');

class SMTPProviderController extends entityController {

	constructor(){
		super(process.env.smtp_providers_table, 'smtpprovider');
		this.table_name = process.env.smtp_providers_table;
		this.descriptive_name = 'smtpprovider';
	}
        
}

module.exports = new SMTPProviderController();