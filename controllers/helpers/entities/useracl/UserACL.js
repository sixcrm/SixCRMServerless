const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

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

}
