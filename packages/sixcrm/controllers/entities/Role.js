
const _ = require('lodash');
var entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

//Technical Debt: Override the list method
module.exports = class RoleController extends entityController {

	constructor(){
		super('role');

		this.search_fields = ['name'];
	}

	//Technical Debt: finish!
	associatedEntitiesCheck(){
		return Promise.resolve([]);
	}

	getPermissions(role){
		if(_.has(role, 'permissions')){
			return role.permissions;
		}else{
			return null
		}
	}
}

