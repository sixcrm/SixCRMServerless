
const _ = require('lodash');

const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;

var entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

const OWNER_ROLE_ID = 'cae614de-ce8a-40b9-8137-3d3bdff78039';

class UserACLController extends entityController {

	constructor(){
		super('useracl');
	}

	async getPartiallyHydratedACLObject(useracl){
		useracl.account = await this.getAccount(useracl);
		useracl.role = await this.getRole(useracl);

		return useracl;

	}

	getACLByUser({user: user}){
		return this.listByUser({user:user});

	}

	create({entity, owner_user = false}) {
		if (entity.role === OWNER_ROLE_ID && !owner_user && !process.env.forceAclCreate) {
			throw eu.getError('server', 'You cannot create an ACL with role Owner');
		}

		return super.create({entity});
	}

	update({entity, primary_key, ignore_updated_at}) {
		if (entity.role === OWNER_ROLE_ID && !process.env.forceAclCreate) {
			throw eu.getError('server', 'You cannot set role to Owner');
		}

		return this.get({id: entity.id, fatal: true}).then((acl) => {
			if (acl.role === OWNER_ROLE_ID && !process.env.forceAclCreate) {
				throw eu.getError('server', 'You cannot downgrade an Owner');
			}

			return super.update({entity, primary_key: primary_key, ignore_updated_at: ignore_updated_at});
		});

	}

	updateTermsAndConditions(useracl_terms_and_conditions) {
		return this.get({id: useracl_terms_and_conditions.useracl}).then((acl) => {
			acl.termsandconditions = useracl_terms_and_conditions.version;

			return super.update({entity: acl});
		})

	}

	delete({id, primary_key}) {

		return this.get({id, fatal: true}).then((acl) => {
			if (acl.role === OWNER_ROLE_ID) {
				throw eu.getError('server', 'You cannot delete an Owner');
			}

			return super.delete({id: id, primary_key: primary_key})
		});

	}

	getACLByAccount({account}){
		let index_value = this.getID(account);

		global.disableaccountfilter = true;
		return this.queryBySecondaryIndex({field: 'account', index_value: index_value, index_name: 'account-index'}).then((result) => {
			global.disableaccountfilter = false;
			return this.getResult(result);
		});

	}

	getUser(useracl){
		if(_.has(useracl, 'user') && _.has(useracl.user, 'id')){
			return useracl.user;
		}

		return this.executeAssociatedEntityFunction('userController', 'get', {id: useracl.user}).then((user) => {
			if (!user) {
				const partial_user = {id: useracl.user, name: useracl.user};
				return Promise.resolve(partial_user);
			}

			return Promise.resolve(user);
		});

	}

	getAccount(useracl){
		if(_.has(useracl, 'account') && _.has(useracl.account, 'id')){
			return useracl.account;
		}

		return this.executeAssociatedEntityFunction('accountController', 'get', {id: useracl.account}).then(result => {
			return result;
		});

	}

	getRole(useracl){
		if(_.has(useracl, 'role') && _.has(useracl.role, 'id')){
			return useracl.role;
		}

		return this.executeAssociatedEntityFunction('RoleController', 'getUnsharedOrShared', {id: useracl.role});

	}

	assure(useracl){
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
		const query_parameters = {
			filter_expression: '#role = :rolev',
			expression_attribute_values: { ':rolev': this.getID(role) },
			expression_attribute_names: { '#role': 'role' }
		};

		return this.listByAccount({query_parameters: query_parameters, pagination: pagination, fatal: fatal, role: role});

	}

}

module.exports = UserACLController;
