'use strict';
const _ = require('underscore');
var dynamoutilities = require('../lib/dynamodb-utilities.js');
var entityController = require('./Entity.js');

class roleController extends entityController {

	constructor(){
		super(process.env.roles_table, 'role');
		this.table_name = process.env.roles_table;
		this.descriptive_name = 'role';
	}
	
}

module.exports = new roleController();
