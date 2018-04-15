
const _ = require('lodash');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');

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

		du.debug('Associated Entities Check');

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

		du.debug('Get User By Alias');

		//Technical Debt:  Why are the ACL's disabled here?
		return Promise.resolve(this.disableACLs())
			.then(() => this.getBySecondaryIndex({field:'alias', index_value: user_alias, index_name: 'alias-index'}))
			.then((user) => {

				this.enableACLs();
				return user;

			}).then((user) => {

				if(!_.has(user, 'id')){
					eu.throwError('not_found', 'User not found: '+user_alias);
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

				eu.throwError(error);

			});

	}

	getUserStrict(user_email){

		du.debug('Get User Strict');

		if(!stringutilities.isEmail(user_email)){
			eu.throwError('bad_request','A user identifier or a email is required, "'+user_email+'" provided');
		}

		//Technical Debt:  Why are ACL's disabled here?
		return Promise.resolve(this.disableACLs())
			.then(() => this.get({id: user_email}))
			.then((user) => {

				this.enableACLs();

				return user;

			}).then((user) => {

				if(_.isNull(user) || !_.has(user, 'id')){
					eu.throwError('not_found', 'User not found: '+user_email);
				}

				return user;

			}).then((user) => {

				this.setGlobalUser(user);

				return user;

			}).then((user) => {

				this.disableACLs();
				return this.getACLPartiallyHydrated(user).then((acl) => {
					this.enableACLs();

					global.user.acl = acl;
					return user;
				});

			}).catch(error => {

				if(error.code == 404){
					return Promise.resolve(false);
				}

				du.error(error);
				eu.throwError(error);

			});

	}

	validateGlobalUser(){

		du.debug('Validate Global User');

		if(!objectutilities.hasRecursive(global, 'user.id') || !this.isEmail(global.user.id)){
			eu.throwError('server', 'Unexpected argumentation');
		}

		return true;

	}

	getHydrated(id){

		du.debug('Get Hydrated');

		return this.get({id: id})
			.then((user) => {

				if (!_.has(user, 'id')) {
					eu.throwError('not_found', 'User does not exist: '+id);
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

				eu.throwError(error);

			});

	}

	getACL(user){

		du.debug('Get ACL');

		if(_.has(user, 'acl') && _.isArray(user.acl)){
			return user.acl;
		}

		return this.executeAssociatedEntityFunction('userACLController', 'getACLByUser', {user: user.id})
			.then(useracls => this.getResult(useracls, 'useracls'));

	}

	//Necessary?
	getACLPartiallyHydrated(user){

		du.debug('Get ACL Partially Hydrated');

		return this.executeAssociatedEntityFunction('userACLController','queryBySecondaryIndex', {field: 'user', index_value: user.id, index_name: 'user-index'})
			.then((response) => this.getResult(response, 'useracls'))
			.then((acls) => {
				du.debug('ACLs: ', acls);

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

		du.debug('Get Account');

		if(id == '*'){
			return this.executeAssociatedEntityFunction('accountController', 'getMasterAccount', {});
		}

		return this.executeAssociatedEntityFunction('accountController', 'get', {id: id});

	}

	getAccessKey(id){

		du.debug('Get Access Key');

		return this.executeAssociatedEntityFunction('accessKeyController', 'get', {id: id});

	}

	getAccessKeyByKey(id){

		du.debug('Get Access Key By Key');

		return this.executeAssociatedEntityFunction('accessKeyController', 'getAccessKeyByKey', {id: id});

	}

	createStrict(user){

		du.debug('Create Strict');

		if(!objectutilities.hasRecursive(global, 'user.id')){
			eu.throwError('server', 'Unset user in globals');
		}

		if(global.user.id != user.id){
			eu.throwError('server', 'User ID does not match Global User ID');
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

		du.debug('Get User By Access Key ID');

		return this.getBySecondaryIndex({field: 'access_key_id', index_value: access_key_id, index_name: 'access_key_id-index'});

	}

	create({entity: user}){

		du.debug('User.create');

		if(!_.has(this, 'userHelperController')){

			const UserHelperController = global.SixCRM.routes.include('helpers', 'entities/user/User.js');
			this.userHelperController = new UserHelperController();

		}

		user = this.userHelperController.appendAlias(user);

		return super.create({entity: user});

	}

	assureUser(user_id){

		du.debug('Assure User');

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
					})

			});

	}

	getUsersByAccount({pagination, fatal}){

		du.debug('Get Users By Account');

		if(this.isMasterAccount()){
			return this.list({pagination: pagination, fatal: fatal});
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

		du.debug('User.can()');

		if(action === 'update' && objectutilities.hasRecursive(global, 'user.id') && global.user.id === id) {
			return Promise.resolve(true);
		}

		return super.can({account: account, object: object, action: action, id: id, fatal: fatal})

	}

}
