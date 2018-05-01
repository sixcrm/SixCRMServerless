
const _ = require('lodash');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');
const mungeutilities = global.SixCRM.routes.include('lib', 'munge-utilities.js');
const mvu = global.SixCRM.routes.include('lib','model-validator-utilities.js');

module.exports = class UserHelperController{

	constructor(){

		du.warning('event: ', global.SixCRM.configuration.event);

	}

	appendAlias(user){

		du.debug('Append Alias');

		if(!_.has(user, 'alias')){
			user.alias = mungeutilities.munge(user.id);
		}

		return user;

	}

	getFullName(user){

		du.debug('Get Full Name');

		let full_name = [];

		if(_.has(user, 'first_name')){
			full_name.push(user.first_name);
		}

		if(_.has(user, 'last_name')){
			full_name.push(user.last_name);
		}

		full_name = arrayutilities.compress(full_name, ' ', '');

		if(stringutilities.nonEmpty(full_name)){
			return full_name;
		}

		return null;

	}

	getAddress(user){

		du.debug('Get Address');

		if(_.has(user, 'address')){

			return user.address;

		}

		return null;

	}

	getPrototypeUser(email){

		du.debug('Get Prototype User');

		let prototype_user = {
			id: email,
			name: email,
			active: false,
			first_name: email, // Technical Debt: Find another way to pass validation instead of using email.
			last_name: email // Technical Debt: Find another way to pass validation instead of using email.
		};

		return prototype_user;

	}

	createProfile(email){

		du.debug('Create Profile');
		return Promise.resolve()
			.then(() => {

				if(!stringutilities.isEmail(email)){
					throw eu.getError('server', 'Email is not a email: "'+email+'".');
				}
				return;

			}).then(() => {

				if(!_.has(this, 'userController')){
					const UserController = global.SixCRM.routes.include('entities','User.js');
					this.userController = new UserController();
				}

				this.userController.disableACLs();

				return this.userController.exists({entity: {id: email}}).then((exists) => {

					if(exists == true){
						throw eu.getError('bad_request', 'A user account associated with the email "'+email+'" already exists.');
					}
					return;

				});

			})
			.then(() => this.buildCreateProfilePrototypes(email))
			.then((prototypes) => this.saveCreateProfilePrototypes(prototypes))
			.then((profile_elements) => this.validateSaveCreateProfilePrototypes(profile_elements))
			.then(({account, user, role, user_setting}) => {

				if(!_.has(this, 'userACLHelperController')){
					const UserACLHelperController = global.SixCRM.routes.include('helpers', 'entities/useracl/UserACL.js');
					this.userACLHelperController = new UserACLHelperController();
				}

				let prototype_user_acl_object = this.userACLHelperController.getPrototypeUserACL({user: user.id, account: account.id, role: role.id});

				if(!_.has(this, 'userACLController')){
					const UserACLController = global.SixCRM.routes.include('entities', 'UserACL.js');
					this.userACLController = new UserACLController();
				}

				return this.userACLController.create({entity: prototype_user_acl_object}).then((user_acl) => {

					return {user_acl: user_acl, account: account, role: role, user: user, user_setting: user_setting};

				});

			}).then(({user, user_acl, account, role}) => {

				//Note:  Phony hydration!
				user_acl.account = account;
				user_acl.role = role;
				user.acl = [user_acl];

				return user;

			}).then((user) => {

				mvu.validateModel(user, global.SixCRM.routes.path('model', 'entities/user.json'));

				return user;

			}).then(user => {

				if(!_.has(this, 'userACLController')){
					const UserACLController = global.SixCRM.routes.include('entities', 'UserACL.js');
					this.userACLController = new UserACLController();
				}

				this.userACLController.enableACLs();

				return user;

			});

	}

	buildCreateProfilePrototypes(email){

		du.debug('Build Create Profile Prototypes');

		if(!_.has(this, 'accountHelperController')){
			const AccountHelperController = global.SixCRM.routes.include('helpers', 'entities/account/Account.js');
			this.accountHelperController = new AccountHelperController();
		}

		if(!_.has(this, 'userSettingHelperController')){
			const UserSettingHelperController = global.SixCRM.routes.include('helpers', 'entities/usersetting/UserSetting.js');
			this.userSettingHelperController = new UserSettingHelperController();
		}

		let prototype_user = this.getPrototypeUser(email);
		let prototype_account = this.accountHelperController.getPrototypeAccount(email)
		let prototype_user_setting = this.userSettingHelperController.getPrototypeUserSetting(email);

		return {
			prototype_user: prototype_user,
			prototype_account: prototype_account,
			prototype_user_setting: prototype_user_setting
		};

	}

	saveCreateProfilePrototypes({prototype_user, prototype_account, prototype_user_setting}){

		du.debug('Save Create Profile Prototypes');

		if(!_.has(this, 'accountController')){
			const AccountController = global.SixCRM.routes.include('entities', 'Account.js');
			this.accountController = new AccountController();
		}

		if(!_.has(this, 'roleController')){
			const RoleController = global.SixCRM.routes.include('entities', 'Role.js');
			this.roleController = new RoleController();
		}

		if(!_.has(this, 'userSettingController')){
			const UserSettingController = global.SixCRM.routes.include('entities', 'UserSetting.js');
			this.userSettingController = new UserSettingController();
		}

		if(!_.has(this, 'userController')){
			const UserController = global.SixCRM.routes.include('entities', 'User.js');
			this.userController = new UserController();
		}

		let promises = [];

		promises.push(this.accountController.create({entity: prototype_account}));
		promises.push(this.userController.create({entity: prototype_user}));
		//Technical Debt:  This should be a lookup, not a hardcoded string
		//Technical Debt:  This should use a immutable object query...
		promises.push(this.roleController.get({id: 'cae614de-ce8a-40b9-8137-3d3bdff78039'}));
		promises.push(this.userSettingController.create({entity: prototype_user_setting}));

		return Promise.all(promises).then(([account, user, role, user_setting]) => {
			return {
				account: account,
				user: user,
				role: role,
				user_setting: user_setting
			};
		});

	}

	validateSaveCreateProfilePrototypes(argumentation){

		du.debug('Validate Save Create Profile Prototypes');

		mvu.validateModel(argumentation, global.SixCRM.routes.path('model','helpers/entities/user/createprofileelements.json'));

		return argumentation;

	}

	introspection(user, fatal){

		du.debug('Introspection');

		fatal = (_.isUndefined(fatal) || _.isNull(fatal))?false:fatal;

		return this.setIntrospectionUser(user, fatal)
			.then((user) => this.rectifyUserTermsAndConditions(user))
			.then((user) => this.rectifyAuth0Id(user))
			.then((user) => this.applyUserSettings(user))
			.then((user) => {

				this.setGlobalUser(user);
				return user;

			});

	}

	async rectifyAuth0Id(user){

		du.debug('Rectify Auth0 ID');

		if(!_.has(user, 'auth0_id') || !stringutilities.nonEmpty(user.auth0_id)){

			let auth0_id = this.getAuth0IdFromRequest();

			if(!_.isNull(auth0_id)){

				if(!_.has(this, 'userController')){
					const UserController = global.SixCRM.routes.include('entities', 'User.js');
					this.userController = new UserController();
				}

				this.userController.disableACLs();
				await this.userController.updateProperties({id: user.id, properties:{auth0_id: auth0_id}});
				this.userController.disableACLs();

			}

		}

		return user;

	}

	getAuth0IdFromRequest(){

		du.debug('Get Auth0 ID From Request');

		return null;

	}


	setIntrospectionUser(user, fatal){

		du.debug('Set Introspection User');

		if(_.isUndefined(user) || _.isNull(user)){

			if(fatal){
				throw eu.getError('bad_request', 'Introspection method requires a user argument in fatal mode.');
			}

			if(!_.has(global, 'user')){
				throw eu.getError('bad_request', 'Introspection method requires a global user or a user argument.');
			}

			user = global.user;

		}

		if(stringutilities.isEmail(user)){
			return this.createProfile(user);
		}

		return Promise.resolve(user);

	}

	rectifyUserTermsAndConditions(user){

		du.debug('Rectify User Terms and Conditions');

		return this.getMostRecentTermsAndConditionsDocuments()
			.then(({user_tncs, owner_tncs}) => {

				if (user_tncs.version !== user.termsandconditions) {
					user.termsandconditions_outdated = true;
				}

				let acls = [];

				if(objectutilities.hasRecursive(user, 'acl') && arrayutilities.isArray(user.acl) && arrayutilities.nonEmpty(user.acl)){
					acls = arrayutilities.map(user.acl, (acl) => {
						if (acl.role.name === 'Owner' && acl.termsandconditions !== owner_tncs.version) {
							acl.termsandconditions_outdated = true;
						}
						return acl;
					});
				}

				user.acl = acls;

				return user;

			});

	}

	getMostRecentTermsAndConditionsDocuments(){

		du.debug('Get Most Recent Terms and Conditions Documents');

		if(!_.has(this, 'termsAndConditionsController')){
			const TermsAndConditionsController = global.SixCRM.routes.include('helpers', 'terms-and-conditions/TermsAndConditions.js');
			this.termsAndConditionsController = new TermsAndConditionsController();
		}

		return Promise.all([
			this.termsAndConditionsController.getLatestTermsAndConditions(),
			this.termsAndConditionsController.getLatestTermsAndConditions('owner')
		]).then(([user_tncs, owner_tncs]) => {

			if(_.isNull(user_tncs) || !_.has(user_tncs, 'version')){
				throw eu.getError('server', 'Unable to acquire Terms & Conditions');
			}

			if(_.isNull(owner_tncs) || !_.has(owner_tncs, 'version')){
				throw eu.getError('server', 'Unable to acquire Owner Terms & Conditions');
			}

			return {
				user_tncs: user_tncs,
				owner_tncs: owner_tncs
			};

		});

	}

	applyUserSettings(user){

		du.debug('Apply User Settings');

		if(!_.has(this, 'userSettingController')){
			const UserSettingController = global.SixCRM.routes.include('entities', 'UserSetting.js');
			this.userSettingController = new UserSettingController();
		}

		this.userSettingController.disableACLs();
		return this.userSettingController.get({id: user.id}).then(result => {
			this.userSettingController.enableACLs();

			if(!_.isNull(result)){
				user.usersetting = result;
			}//else?

			return user;

		});

	}

	setGlobalUser(user){

		if(!_.has(this, 'userController')){
			const UserController = global.SixCRM.routes.include('entities', 'User.js');
			this.userController = new UserController();
		}

		return this.userController.setGlobalUser(user);

	}

}
