'use strict';
const _ = require('underscore');

var dynamoutilities = require('../lib/dynamodb-utilities.js');

var accessKeyController = require('./AccessKey.js');
var entityController = require('./Entity.js');

class userController extends entityController {

	constructor(){
		super(process.env.users_table, 'user');
		this.table_name = process.env.users_table;
		this.descriptive_name = 'user';
	}
	
	getUserByAccessKeyId(access_key_id){
		return this.getBySecondaryIndex('access_key-id', access_key_id, 'access_key_id-index');
	}
	
	getAccessKey(id){
		return accessKeyController.get(id);
	}
	
	getAccessKeyByKey(id){
		return accessKeyController.getAccessKeyByKey(id);
	}
        
}

module.exports = new userController();