const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
//const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const RoleHelperController = global.SixCRM.routes.include('helpers', 'entities/role/Role.js');
const AccountHelperController = global.SixCRM.routes.include('helpers', 'entities/account/Account.js');

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

	async setAccountPermissions({role, account}){

		du.debug('Set Account Permissions');

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
