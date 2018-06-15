
const _ = require('lodash');

const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;

var entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

class UserACLController extends entityController {

	constructor(){
		super('useracl');
	}

	async getPartiallyHydratedACLObject(useracl){

		du.debug('Get Partially Hydrated ACL Object');

		const UserACLHelperController = global.SixCRM.routes.include('helpers', 'entities/useracl/UserACL.js');
		let userACLHelperController = new UserACLHelperController();

		const account = await this.getAccount(useracl);
		const role = await this.getRole(useracl);

		useracl.account = account;
		useracl.role = await userACLHelperController.setAccountPermissions({role: role, account: account});

		return useracl;

	}

	getACLByUser({user: user}){

		du.debug('Get ACL By User');

		return this.listByUser({user:user});

	}

	create({entity, primary_key}) {

		du.debug('UserACLController Create');

		return super.create({entity: entity, primary_key: primary_key});
	}

	update({entity, primary_key, ignore_updated_at}) {

		du.debug('UserACLController Update');

		return super.update({entity: entity, primary_key: primary_key, ignore_updated_at: ignore_updated_at});
	}

	updateTermsAndConditions(useracl_terms_and_conditions) {

		du.debug('UserACLController Terms And Conditions Update', useracl_terms_and_conditions);

		return this.get({id: useracl_terms_and_conditions.useracl}).then((acl) => {
			acl.termsandconditions = useracl_terms_and_conditions.version;

			return super.update({entity: acl});
		})

	}

	delete({id, primary_key}) {

		return super.delete({id: id, primary_key: primary_key}).then((acl) => {

			//Technical Debt:  Broken
			//this.createNotification(acl, 'deleted', 'You have been removed from account.');

			return acl;

		});

	}

	getACLByAccount({account}){

		du.debug('Get ACL By Account');

		let index_value = this.getID(account);

		global.disableaccountfilter = true;
		return this.queryBySecondaryIndex({field: 'account', index_value: index_value, index_name: 'account-index'}).then((result) => {
			global.disableaccountfilter = false;
			return this.getResult(result);
		});

	}

	getUser(useracl){

		du.debug('Get User');

		if(_.has(useracl, 'user') && _.has(useracl.user, 'id')){
			return useracl.user;
		}

		return this.executeAssociatedEntityFunction('userController', 'get', {id: useracl.user}).then((user) => {
			if (!user) {
				const partial_user = {id: useracl.user, name: useracl.user};

				du.debug('No User found for ACL, return partially hydrated user', partial_user);

				return Promise.resolve(partial_user);
			}

			return Promise.resolve(user);
		});

	}

	getAccount(useracl){

		du.debug('Get Account');

		if(_.has(useracl, 'account') && _.has(useracl.account, 'id')){
			return useracl.account;
		}

		return this.executeAssociatedEntityFunction('accountController', 'get', {id: useracl.account}).then(result => {
			return result;
		});

	}

	getRole(useracl){

		du.debug('Get Role');

		if(_.has(useracl, 'role') && _.has(useracl.role, 'id')){
			return useracl.role;
		}

		return this.executeAssociatedEntityFunction('RoleController', 'getUnsharedOrShared', {id: useracl.role});

	}

	assure(useracl){

		du.debug('Assure');

		return new Promise((resolve, reject) => {

			this.getACLByUser({user: useracl.user}).then((useracls) => {

				let acl = this.getResult(useracls);

				let identified_acl = false;

				if(!_.isNull(acl)){
					acl.forEach((acl_object) => {

						if(acl_object.account == useracl.account){

							identified_acl = acl_object;
							return true;

						}

					});
				}

				if(_.has(identified_acl, 'id')){
					du.info('Identified ACL:', identified_acl);
					return resolve(identified_acl);
				}else{
					du.info('Unable to identify ACL');
					return this.create({entity: useracl}).then((acl) => {
						du.info('ACL created: ', acl);
						return resolve(acl);
					}).catch((error) => {
						return reject(error);
					});

				}

			}).catch((error) => {

				return reject(error);

			});

		});

	}

	listByRole({pagination, fatal, role}){

		du.debug('Get ACL By Role');

		const query_parameters = {
			filter_expression: '#role = :rolev',
			expression_attribute_values: { ':rolev': this.getID(role) },
			expression_attribute_names: { '#role': 'role' }
		};

		return this.listByAccount({query_parameters: query_parameters, pagination: pagination, fatal: fatal, role: role});

	}

}

module.exports = UserACLController;
