const _ = require('lodash');

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;

module.exports = class PermissionedController {

	constructor(){

		this.permissionutilities = require('@6crm/sixcrmcore/util/permission-utilities').default;

	}

	can({ object, action, fatal}){
		fatal = (_.isUndefined(fatal))?false:fatal;

		//Technical Debt:  Introduce account and ID
		return Promise.resolve(this.permissionutilities.validatePermissions(action, object)).then(permission => {

			if(permission == false && fatal == true){

				du.error(action, permission, object, global.user, global.account);

				this.throwPermissionsError();

			}

			return permission;

		});

	}

	throwPermissionsError(){
		//Technical Debt:  Embellish this message
		throw eu.getError('forbidden', 'Invalid Permissions: user does not have sufficient permission to perform this action.');

	}

	disableACLs(){
		this.permissionutilities.disableACLs();

		return;

	}

	enableACLs(){
		this.permissionutilities.enableACLs();

		return;

	}

	setGlobalUser(user){
		if(_.has(user, 'id') || this.isEmail(user)){

			this.permissionutilities.setGlobalUser(user);

		}

		return;

	}

	setGlobalCustomer(customer){
		if(_.has(customer, 'id')){

			this.permissionutilities.setGlobalCustomer(customer);

		}

		return;

	}

	unsetGlobalUser(){
		this.permissionutilities.unsetGlobalUser();

		return;

	}

	isMasterAccount(){
		return this.permissionutilities.isMasterAccount();

	}

	accountFilterDisabled(){
		return this.permissionutilities.accountFilterDisabled()

	}

}
