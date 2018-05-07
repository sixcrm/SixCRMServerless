
const _ = require('lodash');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

class EntityPermissionsHelper {
	static isShared(action, acl) {
		du.debug('Is Shared');
		const {allow, deny} = acl;
		const account = global.account;
		const user = global.user.id;

		const target = { account, user, action };

		if (!_.some(deny, entry => this.match(entry, target))) return true;
		if (_.some(allow, entry => this.match(entry, target))) return true;
		return false;
	}

	static match(permission_str, {account, user, action}) {
		du.debug('Match');
		const [
			source_account = '*',
			source_user = '*',
			source_action = '*'
		] = permission_str.split('/');

		return _.every([
			[source_account, account],
			[source_user, user],
			[source_action, action],
		], ([source, target]) => source === '*' || source === target);
	}
}

module.exports = EntityPermissionsHelper;
