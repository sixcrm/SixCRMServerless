const _ = require('lodash');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
//const timestamp = require('@6crm/sixcrmcore/util/timestamp').default;
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
}
