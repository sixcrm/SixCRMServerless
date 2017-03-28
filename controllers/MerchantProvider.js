'use strict';
var entityController = require('./Entity.js');

class merchantProviderController extends entityController {

	constructor(){
		super(process.env.merchant_providers_table, 'merchantprovider');
		this.table_name = process.env.merchant_providers_table;
		this.descriptive_name = 'merchantprovider';
	}
        
}

module.exports = new merchantProviderController();