const _ = require('lodash');
const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const eu = require('@sixcrm/sixcrmcore/util/error-utilities').default;
//const timestamp = require('@sixcrm/sixcrmcore/util/timestamp').default;
const RoleHelperController = global.SixCRM.routes.include('helpers', 'entities/role/Role.js');

module.exports = class UserACLHelperController {

	constructor(){}

	getPrototypeUserACL({user, account, role}){

		du.debug('Get Prototype User ACL');

		let acl_prototype = {
			user: user,
			account: account,
			role: role
		};

		return acl_prototype;

	}

	async createNewUserACL({account, user, role}){

		du.debug('Create New User ACL');

		if(!_.has(account, 'id')){
			throw eu.getError('server', 'Expected account to have id property.');
		}

		if(!_.has(user, 'id')){
			throw eu.getError('server', 'Expected user to have id property.');
		}

		if(!_.has(role, 'id')){
			throw eu.getError('server', 'Expected role to have id property.');
		}

		let user_acl_prototype = await this.getPrototypeUserACL({user: user.id, account: account.id, role: role.id});

		const UserACLController = global.SixCRM.routes.include('entities', 'UserACL.js');
		const userACLController = new UserACLController();

		userACLController.disableACLs();
		let user_acl = await userACLController.create({entity: user_acl_prototype});
		userACLController.enableACLs();

		return user_acl;

	}

	async setAccountPermissions({role, account}){

		du.debug('Set Account Permissions');

		const AccountHelperController = global.SixCRM.routes.include('helpers', 'entities/account/Account.js');
		let accountHelperController = new AccountHelperController();

		if(accountHelperController.isAccountDisabled(account)){

			let roleHelperController = new RoleHelperController();

			const disabled_role = await roleHelperController.getDisabledRole();

			let intersectional_role = roleHelperController.roleIntersection(role, disabled_role);

			return intersectional_role;

		}

		return role;

	}

}
