
const _ = require('lodash');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');
const mungeutilities = global.SixCRM.routes.include('lib', 'munge-utilities.js');

const JWTProvider = global.SixCRM.routes.include('providers', 'jwt-provider.js')

module.exports = class UserHelperController{

	constructor(){

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

	async createProfile(email){

		du.debug('Create Profile');

		if(!stringutilities.isEmail(email)){
			throw eu.getError('server', 'Email is not a email: "'+email+'".');
		}

		if(!_.has(this, 'userController')){
			const UserController = global.SixCRM.routes.include('entities','User.js');
			this.userController = new UserController();
		}

		this.userController.disableACLs();
		const exists = await this.userController.exists({entity: {id: email}});
		this.userController.enableACLs();

		if(exists == true){
			throw eu.getError('bad_request', 'A user account associated with the email "'+email+'" already exists.');
		}

		let prototypes = this.buildCreateProfilePrototypes(email);
		let profile_elements = await this.saveCreateProfilePrototypes(prototypes);
		let {user} = await this.validateSaveCreateProfilePrototypes(profile_elements);

		user.acl = [];

		global.SixCRM.validate(user, global.SixCRM.routes.path('model', 'entities/user.json'));

		return user;

	}

	buildCreateProfilePrototypes(email){

		du.debug('Build Create Profile Prototypes');

		if(!_.has(this, 'userSettingHelperController')){
			const UserSettingHelperController = global.SixCRM.routes.include('helpers', 'entities/usersetting/UserSetting.js');
			this.userSettingHelperController = new UserSettingHelperController();
		}

		let prototype_user = this.getPrototypeUser(email);
		let prototype_user_setting = this.userSettingHelperController.getPrototypeUserSetting(email);

		return {
			prototype_user: prototype_user,
			prototype_user_setting: prototype_user_setting
		};

	}

	async saveCreateProfilePrototypes({prototype_user, prototype_user_setting}){

		du.debug('Save Create Profile Prototypes');

		if(!_.has(this, 'userSettingController')){
			const UserSettingController = global.SixCRM.routes.include('entities', 'UserSetting.js');
			this.userSettingController = new UserSettingController();
		}

		if(!_.has(this, 'userController')){
			const UserController = global.SixCRM.routes.include('entities', 'User.js');
			this.userController = new UserController();
		}

		this.userController.disableACLs();
		let user = await this.userController.create({entity: prototype_user});
		this.userController.enableACLs();

		this.userSettingController.disableACLs();
		let user_setting = await this.userSettingController.create({entity: prototype_user_setting});
		this.userSettingController.enableACLs();

		return {
			user: user,
			user_setting: user_setting
		};

	}

	validateSaveCreateProfilePrototypes(argumentation){

		du.debug('Validate Save Create Profile Prototypes');

		global.SixCRM.validate(argumentation, global.SixCRM.routes.path('model','helpers/entities/user/createprofileelements.json'));

		return argumentation;

	}

	async introspection(user, fatal = false){

		du.debug('Introspection');

		user = await this.setIntrospectionUser(user, fatal);
		user = await this.rectifyUserTermsAndConditions(user);
		user = await this.rectifyAuth0Id(user);
		user = await this.applyUserSettings(user);

		this.setGlobalUser(user);

		return user;

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

		if(objectutilities.hasRecursive(global.SixCRM.configuration, 'event.Headers.Authorization') && stringutilities.nonEmpty(global.SixCRM.configuration.event.Headers.Authorization)){

			let jwtprovider = new JWTProvider().setJWTType('site');
			let decoded_token = jwtprovider.decodeJWT(global.SixCRM.configuration.event.Headers.Authorization);
			if(_.has(decoded_token, 'sub') && stringutilities.nonEmpty(decoded_token.sub)){
				return decoded_token.sub;
			}

		}
		return null;

	}


	async setIntrospectionUser(user, fatal = true){

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

		if(!_.has(user, 'id')){
			throw eu.getError('server', 'Unrecognized argument: '+user);
		}

		return user;

	}

	async rectifyUserTermsAndConditions(user){

		du.debug('Rectify User Terms and Conditions');

		let {user_tncs, owner_tncs} = await this.getMostRecentTermsAndConditionsDocuments();

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

	async applyUserSettings(user){

		du.debug('Apply User Settings');

		if(!_.has(this, 'userSettingController')){
			const UserSettingController = global.SixCRM.routes.include('entities', 'UserSetting.js');
			this.userSettingController = new UserSettingController();
		}

		this.userSettingController.disableACLs();
		let result = await this.userSettingController.get({id: user.id});
		this.userSettingController.enableACLs();

		if(!_.isNull(result)){
			user.usersetting = result;
		}

		return user;

	}

	setGlobalUser(user){

		if(!_.has(this, 'userController')){
			const UserController = global.SixCRM.routes.include('entities', 'User.js');
			this.userController = new UserController();
		}

		return this.userController.setGlobalUser(user);

	}

}
