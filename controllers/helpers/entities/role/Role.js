const _ = require('lodash');
const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const eu = require('@sixcrm/sixcrmcore/util/error-utilities').default;
const arrayutilities = require('@sixcrm/sixcrmcore/util/array-utilities').default;
const objectutilities = require('@sixcrm/sixcrmcore/util/object-utilities').default;

module.exports = class RoleHelperController {

	constructor() {

		//do nothing!

	}

	async getDisabledRole() {

		du.debug('Get Disabled Role');

		if (!_.has(this, 'roleController')) {
			const RoleController = global.SixCRM.routes.include('entities', 'Role.js');
			this.roleController = new RoleController();
		}

		let disabled_role = await this.roleController.getUnsharedOrShared({
			id: this.getDisabledRoleId()
		});

		if (!_.isNull(disabled_role)) {
			return disabled_role;
		}

		throw eu.getError('server', 'Unable to identify the disabled role.');

	}

	getDisabledRoleId() {

		return '78e507dd-93fc-413b-b21a-819480209740';

	}

	roleIntersection(role1, role2) {

		du.debug('Roles Intersection');

		role1 = this.normalizeRole(role1);
		role2 = this.normalizeRole(role2);

		let intersectional_allows = this.mergePermissionArrays(role1.permissions.allow, role2.permissions.allow);
		let intersectional_denies = this.mergePermissionArrays(role1.permissions.deny, role2.permissions.deny);

		let intersectional_role = {
			name: role1.name + ' - ' + role2.name,
			active: true,
			permissions: {
				allow: intersectional_allows,
				deny: intersectional_denies
			}
		};

		return intersectional_role;

	}

	normalizeRole(role){

		du.debug('Normalize Role');

		if(!objectutilities.hasRecursive(role, 'permissions.allow') || !_.isArray(role.permissions.allow)){
			role.permissions.allow = [];
		}

		if(!objectutilities.hasRecursive(role, 'permissions.deny') || !_.isArray(role.permissions.deny)){
			role.permissions.deny = [];
		}

		return role;

	}

	mergePermissionArrays(permission_array_1, permission_array_2) {

		du.debug('Merge Permission Arrays');

		let merged_array = [];

		if(!_.isArray(permission_array_1)){
			throw eu.getError('server', 'Permission Array 1 is not an array.');
		}

		if(!_.isArray(permission_array_2)){
			throw eu.getError('server', 'Permission Array 2 is not an array.');
		}

		arrayutilities.map(permission_array_1, p1_permission => {

			if(!_.isString(p1_permission)){
				throw eu.getError('server', 'Unrecognized permission structure: '+p1_permission);
			}

			let p1_permission_split = p1_permission.split('/');

			arrayutilities.map(permission_array_2, (p2_permission) => {

				if(!_.isString(p2_permission)){
					throw eu.getError('server', 'Unrecognized permission structure: '+p2_permission);
				}

				let p2_permission_split = p2_permission.split('/');

				if (p1_permission_split[0] == '*' && p1_permission_split.length == 1) {
					merged_array.push(p2_permission);
					return true;
				}

				if (p2_permission_split[0] == '*' && p2_permission_split.length == 1) {
					merged_array.push(p1_permission);
					return true;
				}

				if (p1_permission_split[0] == p2_permission_split[0]) {

					if (p1_permission_split[1] == p2_permission_split[1]) {
						merged_array.push(p2_permission);
						return true;
					}

					if (p1_permission_split[1] == '*') {
						merged_array.push(p2_permission);
						return true;
					}

					if (p2_permission_split[1] == '*') {
						merged_array.push(p1_permission);
						return true;
					}

				}

			});

		});

		return merged_array;

	}

}
