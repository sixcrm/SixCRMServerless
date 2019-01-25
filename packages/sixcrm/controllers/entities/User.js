
const _ = require('lodash');

const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;

const arrayutilities = require('@6crm/sixcrmcore/lib/util/array-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/lib/util/object-utilities').default;
const stringutilities = require('@6crm/sixcrmcore/lib/util/string-utilities').default;

const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

//Technical Debt:  The list method here is tricky
module.exports = class UserController extends entityController {

	constructor(){

		super('user');

		this.search_fields = ['name', 'firstname', 'lastname'];

	}

	//Technical Debt: finish!
	//usersigningstring
	//usersetting
	//userdevicetoken
	//notificationread
	//notification
	//customernote
	associatedEntitiesCheck({id}){
		let return_array = [];

		let data_acquisition_promises = [
			this.executeAssociatedEntityFunction('userACLController', 'listByUser', {user: id})
		];

		return Promise.all(data_acquisition_promises).then(data_acquisition_promises => {

			let useracls = data_acquisition_promises[0];

			if(_.has(useracls, 'useracls') && arrayutilities.nonEmpty(useracls.useracls)){
				arrayutilities.map(useracls.useracls, (useracl) => {
					return_array.push(this.createAssociatedEntitiesObject({name:'Campaign', object: useracl}));
				});
			}

			return return_array;

		});

	}

	getUserByAlias(user_alias){
		//Technical Debt:  Why are the ACL's disabled here?
		return Promise.resolve(this.disableACLs())
			.then(() => this.getBySecondaryIndex({field:'alias', index_value: user_alias, index_name: 'alias-index'}))
			.then((user) => {

				this.enableACLs();
				return user;

			}).then((user) => {

				if(!_.has(user, 'id')){
					throw eu.getError('not_found', 'User not found: '+user_alias);
				}

				return user;

			}).then((user) => {

				return Promise.resolve(this.disableACLs())
					.then(() => this.getHydrated(user.id));

			}).then((user) => {

				this.enableACLs();
				return user;

			}).catch(error => {

				if(error.code == 404){
					return Promise.resolve(false);
				}

				throw eu.getError(error);

			});

	}

	getUserStrict(user_email){
		if(!stringutilities.isEmail(user_email)){
			throw eu.getError('bad_request','A user identifier or a email is required, "'+user_email+'" provided');
		}

		//Technical Debt:  Why are ACL's disabled here?
		return Promise.resolve(this.disableACLs())
			.then(() => this.get({id: user_email}))
			.then((user) => {

				this.enableACLs();

				return user;

			}).then((user) => {

				if(_.isNull(user) || !_.has(user, 'id')){
					throw eu.getError('not_found', 'User not found: '+user_email);
				}

				return user;

			}).then((user) => {

				this.disableACLs();

				return this.getACLPartiallyHydrated(user)
					.then((acl) => {
						this.enableACLs();

						user.acl = acl;

						return user;
					});

			}).catch(error => {

				if(error.code == 404){
					return Promise.resolve(false);
				}

				du.error(error);
				throw eu.getError(error);

			});

	}

	validateGlobalUser(){
		if(!objectutilities.hasRecursive(global, 'user.id') || !this.isEmail(global.user.id)){
			throw eu.getError('server', 'Unexpected argumentation');
		}

		return true;

	}

	getHydrated(id){
		return this.get({id: id})
			.then((user) => {

				if (!_.has(user, 'id')) {
					throw eu.getError('not_found', 'User does not exist: '+id);
				}

				return Promise.all([user, this.getACLPartiallyHydrated(user)]);

			}).then(([user, acl]) => {

				user.acl = acl;

				return user;

			}).catch((error) => {

				du.info(error);
				if (error.code === 404) {
					return null;
				}

				throw eu.getError(error);

			});

	}

	getACL(user){
		if(_.has(user, 'acl') && _.isArray(user.acl)){
			return Promise.resolve(user.acl);
		}

		return this.executeAssociatedEntityFunction('userACLController', 'getACLByUser', {user: user.id})
			.then(useracls => this.getResult(useracls, 'useracls'));

	}

	//Necessary?
	getACLPartiallyHydrated(user){
		return this.executeAssociatedEntityFunction('userACLController','queryBySecondaryIndex', {field: 'user', index_value: user.id, index_name: 'user-index'})
			.then((response) => this.getResult(response, 'useracls'))
			.then((acls) => {
				if(!arrayutilities.nonEmpty(acls)){
					return null;
				}

				//Technical Debt:  Convert to a list query where applicable
				let acl_promises = arrayutilities.map(acls, (acl) => {
					return this.executeAssociatedEntityFunction('userACLController','getPartiallyHydratedACLObject', acl);
				});

				return Promise.all(acl_promises);
			});
	}

	//Technical Debt: Why is this here?
	getAccount(id){
		if(id == '*'){
			return this.executeAssociatedEntityFunction('accountController', 'getMasterAccount', {});
		}

		return this.executeAssociatedEntityFunction('accountController', 'get', {id: id});

	}

	getAccessKey(id){
		return this.executeAssociatedEntityFunction('accessKeyController', 'get', {id: id});

	}

	getAccessKeyByKey(id){
		return this.executeAssociatedEntityFunction('accessKeyController', 'getAccessKeyByKey', {id: id});

	}

	createStrict(user){
		if(!objectutilities.hasRecursive(global, 'user.id')){
			throw eu.getError('server', 'Unset user in globals');
		}

		if(global.user.id != user.id){
			throw eu.getError('server', 'User ID does not match Global User ID');
		}

		this.disableACLs();

		return Promise.resolve(this.disableACLs())
			.then(() => this.create({entity: user}))
			.then((user) => {
				this.enableACLs();
				return user;
			});

	}

	getUserByAccessKeyId(access_key_id){
		return this.getBySecondaryIndex({field: 'access_key_id', index_value: access_key_id, index_name: 'access_key_id-index'});

	}

	create({entity: user}){
		if(!_.has(this, 'userHelperController')){

			const UserHelperController = global.SixCRM.routes.include('helpers', 'entities/user/User.js');
			this.userHelperController = new UserHelperController();

		}

		user = this.userHelperController.appendAlias(user);

		user.id = user.id.toLowerCase();

		return super.create({entity: user});

	}

	assureUser(user_id){
		return this.get({id: user_id})
			.then((user) => {

				if(_.has(user, 'id')){
					return user;
				}

				if(!_.has(this, 'userHelperController')){
					const UserHelperController = global.SixCRM.routes.include('helpers', 'entities/user/User.js');
					this.userHelperController = new UserHelperController();
				}

				return Promise.resolve()
					.then(() => this.userHelperController.getPrototypeUser(user_id))
					.then((user_prototype) => this.create({entity: user_prototype}));

			}).then((user) => {

				if(!_.has(this, 'userSettingHelperController')){
					const UserSettingHelperController = global.SixCRM.routes.include('helpers', 'entities/usersetting/UserSetting.js');
					this.userSettingHelperController = new UserSettingHelperController();
				}

				return Promise.resolve()
					.then(() => this.userSettingHelperController.getPrototypeUserSetting(user.id))
					.then((user_setting_prototype) => this.executeAssociatedEntityFunction('userSettingController', 'create', {entity: user_setting_prototype}))
					.then(() => {
						return user;
					}).catch(error => {
						if(_.includes(error.message, 'A usersetting already exists')){
							return user;
						}
						throw error;
					});

			});

	}

	getUsersByAccount({pagination, fatal}){
		if(this.isMasterAccount()){
			return this.list({pagination: pagination, fatal: fatal}).then(result => {
				return result;
			});
		}

		return this.executeAssociatedEntityFunction('userACLController', 'getACLByAccount', {account: global.account, fatal: fatal})
			.then((user_acl_objects) => {

				if(arrayutilities.isArray(user_acl_objects) && user_acl_objects.length > 0){

					let user_ids = arrayutilities.map(user_acl_objects, (user_acl) => {
						if(_.has(user_acl, 'user')){
							return user_acl.user;
						}
					});

					user_ids = arrayutilities.unique(user_ids);

					let in_parameters = this.createINQueryParameters({field:'id', list_array: user_ids});

					//Technical Debt:  Refactor, must return all users with correct pagination
					return this.list({pagination: pagination, query_parameters: in_parameters});

				}

				return null;

			});

	}

	can({account, object, action, id, fatal}){
		if(action === 'update' && objectutilities.hasRecursive(global, 'user.id') && global.user.id === id) {
			return Promise.resolve(true);
		}

		return super.can({account: account, object: object, action: action, id: id, fatal: fatal})

	}

	delete({id, range_key = null}) {
		if ((global.user.id !== id) && (global.account !== '*')) {
			throw eu.getError('server', `You are not allowed to delete the entity with id ${id}. ${global.user.id} ${global.account}`)
		}

		return super.delete({id, range_key})
	}

}
