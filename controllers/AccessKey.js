'use strict';
var entityController = require('./Entity.js');

class accessKeyController extends entityController {

	constructor(){
		super(process.env.access_keys_table, 'accesskey');
		this.table_name = process.env.access_keys_table;
		this.descriptive_name = 'accesskey';
	}
	
	getAccessKeyByKey(access_key){
		
		return this.getBySecondaryIndex('access_key', access_key, 'access_key-index');
		
	}
	
}

module.exports = new accessKeyController();
