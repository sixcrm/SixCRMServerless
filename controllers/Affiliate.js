'use strict';
const _ = require('underscore');

var dynamoutilities = require('../lib/dynamodb-utilities.js');
var entityController = require('./Entity.js');

class affiliateController extends entityController {

	constructor(){
		super(process.env.affiliates_table, 'affiliate');
		this.table_name = process.env.affiliates_table;
		this.descriptive_name = 'affiliate';
	}
	
}

module.exports = new affiliateController();