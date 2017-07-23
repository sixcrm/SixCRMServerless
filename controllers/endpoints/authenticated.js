'use strict';
const _ = require("underscore");

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const permissionutilities = global.SixCRM.routes.include('lib', 'permission-utilities.js');

const endpointController = global.SixCRM.routes.include('controllers', 'endpoints/endpoint.js');

module.exports = class AuthenticatedController extends endpointController {

    constructor(parameters){

        super(parameters);

        if(_.has(parameters, 'required_permissions')){

            this.required_permissions = parameters.required_permissions;

        }

        this.userController = global.SixCRM.routes.include('controllers', 'entities/User.js');

    }

    preprocessing(event){

        du.debug('Preprocessing');

        return this.validateEvent(event)
  			.then((event) => this.parseEvent(event))
  			.then((event) => this.acquireAccount(event))
  			.then((event) => this.acquireUser(event))
  			.then((event) => this.validateRequiredPermissions(event));

    }

    acquireAccount(event){

        du.debug('Acquire Account');

        return new Promise((resolve, reject) => {

            let pathParameters;
            let account;

            if(_.has(event, "pathParameters")){

                pathParameters = event.pathParameters;

            }else{

                return reject(eu.getError('bad_request','Unset pathParameters in the event.'));

            }

            if(_.has(pathParameters, 'account')){

                account = pathParameters.account;

            }else{

                return reject(eu.getError('bad_request', 'Unable to identify account in pathParameters.'));

            }

            if(!_.isString(account)){

                return reject(eu.getError('bad_request', 'Unrecognized account format.'));

            }

            permissionutilities.setGlobalAccount(account);

            return resolve(event);

        });

    }

    acquireUser(event){

        du.debug('Acquire User');

        if(!_.has(event.requestContext, "authorizer")){

            return Promise.reject(eu.getError('server','Unable to identify the authorizer property in the event request context.'));

        }

        if(!_.has(event.requestContext.authorizer, "user")){

            return Promise.reject(eu.getError('server','Unable to identify the user node in the event request context authorizer property.'));

        }

        let user_string = event.requestContext.authorizer.user;

        du.debug('Event Request Context Authorizer User Alias:', user_string);

        if(!_.isString(user_string)){

            return Promise.reject(eu.getError('server','Event request context authorizer user is an unrecognized format.'));

        }

        if(this.userController.isEmail(user_string)){

            return this.userController.getUserStrict(user_string).then((user) => {

                if(_.has(user, 'id')){

                    permissionutilities.setGlobalUser(user);

                }else if(user == false){

                    if (!this.isUserIntrospection(event)) {
                        return Promise.reject(eu.getError('forbidden', 'Unknown user.  Please contact the system administrator.'));
                    }

                    du.warning('Unable to acquire user, setting global user to email.');

                    permissionutilities.setGlobalUser(user_string);

                    return event;
                }

                return Promise.resolve(event);

            });

        }else{

            return this.userController.getUserByAlias(user_string).then((user) => {

                if(_.has(user, 'id')){

                    permissionutilities.setGlobalUser(user);

                }else if(user == false){

                    if (!this.isUserIntrospection(event)) {
                        return Promise.reject(eu.getError('forbidden', 'Unknown user.  Please contact the system administrator.'));
                    }

                    du.warning('Unable to acquire user, setting global user to alias.');

                    permissionutilities.setGlobalUser(user_string);

                    return event;

                }

                return Promise.resolve(event);

            });

        }

    }

    validateRequiredPermissions(event){

        du.debug('Validate Required Permissions');

        return new Promise((resolve, reject) => {

            permissionutilities.validatePermissionsArray(this.required_permissions).then((permission_object) => {

                du.debug('Permission Object: ', permission_object);

                if(permission_object.has_permission !== true){

                    let error_string = 'Unable to execute action - user lacks permissions: '+permission_object.permission_failures.join(', ');

                    return reject(eu.getError('fobidden', error_string));

                }

                return resolve(event);

            }).catch((error) => {

                return reject(error);

            });

        });

    }

    isUserIntrospection(event) {

        du.debug('Is User Introspection');

        if(_.has(event, 'body') && event.body.match(/^[\s\n\r]*(query)?[\s\n\r]*{[\s\n\r]*userintrospection[\s\n\r]*{/)) {
            return true;
        }

        return false;

    }

}
