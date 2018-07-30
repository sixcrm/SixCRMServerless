const _ = require('lodash');

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;

module.exports = class PermissionedController {

	constructor(){

		this.permissionutilities = require('@6crm/sixcrmcore/util/permission-utilities').default;

	}

	can({ object, action, fatal}){

		du.debug('Can');

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

		du.debug('Throw Permissions Error');

		//Technical Debt:  Embellish this message
		throw eu.getError('forbidden', 'Invalid Permissions: user does not have sufficient permission to perform this action.');

	}

	disableACLs(){

		du.debug('Disable ACLs');

		this.permissionutilities.disableACLs();

		return;

	}

	enableACLs(){

		du.debug('Enable ACLs');

		this.permissionutilities.enableACLs();

		return;

	}

	setGlobalUser(user){

		du.debug('Set Global User');

		if(_.has(user, 'id') || this.isEmail(user)){

			this.permissionutilities.setGlobalUser(user);

		}

		return;

	}

	setGlobalCustomer(customer){

		du.debug('Set Global Customer');

		if(_.has(customer, 'id')){

			this.permissionutilities.setGlobalCustomer(customer);

		}

		return;

	}

	unsetGlobalUser(){

		du.debug('Unset Global User');

		this.permissionutilities.unsetGlobalUser();

		return;

	}

	isMasterAccount(){

		du.debug('Is Master Account');

		return this.permissionutilities.isMasterAccount();

	}

	accountFilterDisabled(){

		du.debug('Account Filter Disabled');

		return this.permissionutilities.accountFilterDisabled()

	}

}
