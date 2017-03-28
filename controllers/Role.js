'use strict';
const _ = require('underscore');
var entityController = require('./Entity.js');

class roleController extends entityController {

	constructor(){
		super(process.env.roles_table, 'role');
		this.table_name = process.env.roles_table;
		this.descriptive_name = 'role';
	}
	
	getPermissions(role){
		if(_.has(role, 'permissions')){
			return role.permissions;
		}else{
			return null
		}
	}
}

module.exports = new roleController();
