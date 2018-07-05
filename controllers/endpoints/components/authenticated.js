const _ = require('lodash');

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
const permissionutilities = require('@6crm/sixcrmcore/util/permission-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const stringutilities = require('@6crm/sixcrmcore/util/string-utilities').default;

const AccountHelperController = global.SixCRM.routes.include('helpers', 'entities/account/Account.js');
const endpointController = global.SixCRM.routes.include('controllers', 'endpoints/components/endpoint.js');

module.exports = class AuthenticatedController extends endpointController {

	constructor(){

		super();

	}

	preprocessing(event){

		du.debug('Preprocessing');

		return this.normalizeEvent(event)
			.then((event) => this.acquireAccount(event))
			.then((event) => this.validateAccount(event))
			.then((event) => this.validateEvent(event))
			.then((event) => this.acquireSubProperties(event))
			.then((event) => this.validateRequiredPermissions(event));

	}

	async validateAccount(event){

		du.debug('Validate Account');

		let accountHelperController = new AccountHelperController();
		await accountHelperController.validateAccount();

		return event;

	}

	acquireAccount(event){

		du.debug('Acquire Account');

		if(objectutilities.hasRecursive(event, 'pathParameters.account')){

			let account = event.pathParameters.account;

			permissionutilities.setGlobalAccount(account);

			return Promise.resolve(event);

		}

		throw eu.getError('bad_request', 'Account missing in path parameter.');

	}

	acquireSubProperties(event){

		du.debug('Acquire Sub Properties');

		return Promise.all([
			this.acquireUser(event)
		]).then(() => {
			return event;
		});

	}

	//Technical Debt:  This is wrought with redundancies....
	acquireUser(event){

		du.debug('Acquire User');

		objectutilities.hasRecursive(event, 'requestContext.authorizer.user', true);

		let user_string = event.requestContext.authorizer.user;

		du.debug('Event Request Context Authorizer User Alias:', user_string);

		if(!_.isString(user_string)){

			throw eu.getError('server','Event request context authorizer user is an unrecognized format.');

		}

		if(!_.has(this, 'userController')){
			const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
			this.userController = new UserController();
		}

		if(stringutilities.isEmail(user_string)){

			return this.userController.getUserStrict(user_string).then((user) => {

				if(_.has(user, 'id')){

					this.userController.setGlobalUser(user);

					return event;

				}

				if(!this.isUserIntrospection(event) && !this.isCreateAccount(event)) {
					throw eu.getError('forbidden', 'Unknown user.  Please contact the system administrator.');
				}

				du.warning('Unable to acquire user, setting global user to email.');

				this.userController.setGlobalUser(user_string);

				return event;

			});

		}else{

			if(!_.has(this, 'userController')){
				const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
				this.userController = new UserController();
			}

			return this.userController.getUserByAlias(user_string).then((user) => {

				if(_.has(user, 'id')){

					this.userController.setGlobalUser(user);

					return event;

				}

				if (!this.isUserIntrospection(event)) {
					return Promise.reject(eu.getError('forbidden', 'Unknown user.  Please contact the system administrator.'));
				}

				du.warning('Unable to acquire user, setting global user to alias.');

				this.userController.setGlobalUser(user_string);

				return event;

			});

		}

	}

	//Technical Debt:  THis function does not need to return a promise...
	//Technical Debt:  Refactor, this is gross...
	validateRequiredPermissions(event){

		du.debug('Validate Required Permissions');

		if(_.has(this, 'required_permissions')){

			let validated_permissions = arrayutilities.map(this.required_permissions, required_permission => {

				let permission_array = required_permission.split('/');

				return permissionutilities.validatePermissions(permission_array[1], permission_array[0]);

			});

			if(_.includes(validated_permissions, false)){

				throw eu.getError('fobidden', 'Unable to execute action.  User lacks permission.');

			}

		}

		return Promise.resolve(event);

	}

	isUserIntrospection(event) {

		du.debug('Is User Introspection');

		if(_.has(event, 'body') && event.body.match(/^[\s\n\r]*(query)?[\s\n\r]*{[\s\n\r]*userintrospection[\s\n\r]*{/)) {
			return true;
		}

		return false;

	}

	isCreateAccount(event) {

		du.debug('Is Create Account');

		if(_.has(event, 'body') && event.body.match(/^[\s\n\r]*(mutation)?[\s\n\r]*{[\s\n\r]*createnewaccount[\s\n\r]*{/)) {
			return true;
		}

		return false;

	}

}
