const _ = require('lodash');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');

//Technical Debt:  This needs to be a helper, it contains general business logic
module.exports = class PermissionUtilities {

	static validatePermissions(action, entity, identifier) {

		du.debug('Validate Permissions');

		if (this.actionChecksDisabled()) {

			return true;

		} else {

			let permission_string = this.buildPermissionString(action, entity, identifier);

			let permissions = this.getPermissions();

			du.warning('Permission String: ' + permission_string, 'Permissions: ', permissions);

			return this.hasPermission(permission_string, permissions.allow);

		}

	}

	static getPermissions() {

		du.debug('Get Permissions');

		if (!_.has(global, 'user') || _.isNull(global.user)) {

			throw eu.getError('server', 'Global is missing the user property.');

		}

		if (!_.has(global, 'account') || _.isNull(global.account)) {

			throw eu.getError('server', 'Global is missing the account property.');

		}

		return this.buildPermissionObject();

	}

	static buildPermissionObject() {

		du.debug('Build Permission Object');

		let allow = [],
			deny = [];

		//du.info(global.user.acl);

		if (objectutilities.hasRecursive(global, 'user.acl') && arrayutilities.nonEmpty(global.user.acl)) {

			arrayutilities.map(global.user.acl, (acl_object) => {

				if (objectutilities.hasRecursive(acl_object, 'account.id')) {

					//du.info('account_parity: '+global.account+' == '+acl_object.account.id);

					if (acl_object.account.id == '*' || acl_object.account.id == global.account) {

						if (objectutilities.hasRecursive(acl_object, 'role.permissions.allow') && arrayutilities.isArray(acl_object.role.permissions.allow)) {

							allow = allow.concat(acl_object.role.permissions.allow);

						} else {

							throw eu.getError('server', 'Unexpected ACL object structure');

						}

						if (objectutilities.hasRecursive(acl_object, 'role.permissions.deny') && arrayutilities.nonEmpty(acl_object.role.permissions.deny)) {

							deny = deny.concat(acl_object.role.permissions.deny);

						}

					}

				} else {

					throw eu.getError('server', 'Unset ACL Account');

				}

			});

		}

		//Technical Debt:  Deny List is being set to "*"
		return {
			allow: arrayutilities.unique(allow),
			deny: ['*']
		};

	}

	//Technical Debt:  This seems remedial
	static buildPermissionString(action, entity, identifier) {

		du.debug('Build Permission String');

		if (_.isUndefined(identifier)) {
			identifier = '*';
		}

		stringutilities.nonEmpty(action, true);

		stringutilities.nonEmpty(entity, true);

		stringutilities.nonEmpty(identifier, true);

		//Technical Debt:  Order matters here.  Ick.
		let permission_array = [entity, action, identifier];

		return arrayutilities.compress(permission_array, '/', '');

	}

	static hasPermission(required_permission_string, permission_array) {

		du.debug('Has Permission');

		let return_value = false;

		if (this.isUniversalPermission(required_permission_string)) {

			return_value = true;

		} else if (arrayutilities.nonEmpty(permission_array)) {

			let permission_match = arrayutilities.find(permission_array, (permission) => {

				return this.isPermissionMatch(required_permission_string, permission);

			});

			if (!_.isUndefined(permission_match)) {

				return_value = true;

			}

		}

		return return_value;

	}

	static isPermissionMatch(required_permission, submitted_permission) {

		du.debug('Is Permission Match');

		if (this.hasWildcardAccess(submitted_permission)) {
			return true;
		}

		if (this.hasSpecificPermission(required_permission, submitted_permission)) {
			return true;
		}

		if (this.hasCanonicalPermission(required_permission, submitted_permission)) {
			return true;
		}

		if (this.hasPermissionSuperset(required_permission, submitted_permission)) {
			return true;
		}

	}

	static hasPermissionSuperset(required_permission, submitted_permission) {

		du.debug('Has Permission Superset');

		let canonical_required_permission_array = this.buildCanonicalPermissionString(required_permission).split('/');
		let canonical_submitted_permission_array = this.buildCanonicalPermissionString(submitted_permission).split('/');

		//Technical Debt:  I don't like the use of "for" here
		for (let i = 0; i < canonical_required_permission_array.length; i++) {

			if (canonical_required_permission_array[i] !== canonical_submitted_permission_array[i] && canonical_submitted_permission_array[i] !== '*') {

				return false;

			}

		}

		return true;

	}

	static isUniversalPermission(required_permission) {

		du.debug('Is Universal Permission');

		//let universal_permissions = this.getUniversalPermissions();

		let permission = arrayutilities.find(this.getUniversalPermissions(), (universal_permission) => {

			return this.isPermissionMatch(required_permission, universal_permission);

		});

		return (!_.isUndefined(permission) && stringutilities.nonEmpty(permission));

	}

	//Technical Debt:  This is a hack, need immuatable objects
	static getUniversalPermissions() {

		du.debug('Get Universal Permissions');

		return ['role/read'];

	}

	static hasCanonicalPermission(required_permission, submitted_permission) {

		du.debug('Has Canonical Permission');

		let canonical_required_permission_string = this.buildCanonicalPermissionString(required_permission);
		let canonical_submitted_permission_string = this.buildCanonicalPermissionString(submitted_permission);

		return (canonical_required_permission_string == canonical_submitted_permission_string);

	}

	static buildCanonicalPermissionString(permission_string) {

		du.debug('Build Canonical Permission String');

		stringutilities.isString(permission_string, true);

		let permission_string_array = permission_string.split('/');

		//Note:  This appears to be strongly bound to the length of the permission string.
		//Technical Debt:  What happens in the case where permission string array length < 3
		//Technical Debt:  Hate the use of for
		for (var i = 0; i < Math.max(0, (3 - permission_string_array.length)); i++) {
			permission_string_array.push('*');
		}

		return arrayutilities.compress(permission_string_array, '/', '');

	}

	static hasWildcardAccess(permission_string) {

		du.debug('Has Wildcard Access');

		stringutilities.isString(permission_string, true);

		return (permission_string == '*');

	}

	static hasSpecificPermission(permission_string, required_permission_string) {

		du.debug('Has Specific Permission');

		stringutilities.isString(permission_string, true);

		stringutilities.isString(required_permission_string, true);

		return (permission_string == required_permission_string);

	}

	static validatePermissionsArray(permissions_array) {

		du.debug('Validate Permissions Array');

		let permissions = this.getPermissions();

		let permission_failures = arrayutilities.find(permissions_array, (permission_string) => {

			return !this.hasPermission(permission_string, permissions.allow);

		});

		permission_failures = (_.isUndefined(permission_failures) || _.isNull(permission_failures)) ? [] : permission_failures

		let permission_object = {
			has_permission: false,
			permission_failures: permission_failures
		};

		if (!arrayutilities.nonEmpty(permission_failures)) {

			permission_object['has_permission'] = true;

		}

		return permission_object;

	}

	static setGlobalAccount(account) {

		du.debug('Set Global Account');

		global.account = account;

	}

	//Technical Debt:  Move this to the global SixCRM Object
	static unsetGlobalAccount() {

		du.debug('Unset Global Account');

		global.account = undefined;

	}

	//Technical Debt:  Move this to the global SixCRM Object
	static unsetGlobalUser() {

		du.debug('Unset Global User.');

		global.user = undefined;

	}

	//Technical Debt:  Move this to the global SixCRM Object
	static setGlobalUser(user) {

		du.debug('Set Global User');

		global.user = user;

	}

	static disableACLs() {

		du.warning('Disable ACLs');

		global.disableactionchecks = true;
		global.disableaccountfilter = true;

	}

	static enableACLs() {

		du.warning('Enable ACLs');

		global.disableactionchecks = false;
		global.disableaccountfilter = false;

	}

	static actionChecksDisabled() {

		du.debug('Action Checks Disabled');

		return (_.has(global, 'disableactionchecks') && global.disableactionchecks == true);

	}

	static accountFilterDisabled() {

		du.debug('Account Filter Disabled');

		return (_.has(global, 'disableaccountfilter') && global.disableaccountfilter == true);

	}

	static areACLsDisabled() {

		du.debug('Are ACLs Disabled');

		return (this.actionChecksDisabled() && this.accountFilterDisabled());

	}

	static isSystemUser() {

		du.debug('Is System User');

		return (global.user == 'system@sixcrm.com');

	}

	static isMasterAccount() {

		du.debug('Is Master Account');

		return (global.account === '*');

	}

	static getState() {

		du.debug('Get State');

		return {
			action_checks_disabled: this.actionChecksDisabled(),
			account_filter_disabled: this.accountFilterDisabled()
		};

	}

	static setPermissions(account, allow, deny) {

		let user = {
			id: 'system@sixcrm.com',
			acl: [{
				account: {
					id: account
				},
				role: {
					permissions: {
						allow: allow,
						deny: deny
					},
				}
			}]
		};

		this.setGlobalUser(user);
		this.setGlobalAccount(account);

	}

}
