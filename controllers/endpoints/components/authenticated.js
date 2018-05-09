
const _ = require('lodash');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const permissionutilities = global.SixCRM.routes.include('lib', 'permission-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');

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

				let permission_utilities_state = JSON.stringify(permissionutilities.getState());

				let question = permission_utilities_state+permissionutilities.buildPermissionString(permission_array[1], permission_array[0]);

				let answer_function = () => {

					let permission = permissionutilities.validatePermissions(permission_array[1], permission_array[0]);

					return permission;

				}

				return global.SixCRM.localcache.resolveQuestion(question, answer_function);

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

		du.debug('Is User Introspection');

		if(_.has(event, 'body') && event.body.match(/^[\s\n\r]*(query)?[\s\n\r]*{[\s\n\r]*createaccount[\s\n\r]*{/)) {
			return true;
		}

		return false;

	}

}
