'use strict';
const _ = require("underscore");
const validator = require('validator');

const du = global.routes.include('lib', 'debug-utilities.js');
const permissionutilities = global.routes.include('lib', 'permission-utilities.js');

const userController = global.routes.include('controllers', 'entities/User.js');
const endpointController = global.routes.include('controllers', 'endpoints/endpoint.js');

module.exports = class AuthenticatedController extends endpointController {

    constructor(parameters){

        super(parameters);

        if(_.has(parameters, 'required_permissions')){

            this.required_permissions = parameters.required_permissions;

        }

    }

    preprocessing(event){

        du.debug('Preprocessing');

        return this.validateEvent(event)
			.then(this.parseEvent)
			.then(this.acquireAccount)
			.then(this.acquireUser)
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

                return reject(new Error('Unset pathParameters in the event.'));

            }

            if(_.has(pathParameters, 'account')){

                account = pathParameters.account;

            }else{

                return reject(new Error('Unable to identify account in pathParameters.'));

            }

            if(!_.isString(account)){

                return reject('Unrecognized account format.');

            }

            permissionutilities.setGlobalAccount(account);

            return resolve(event);

        });

    }

    acquireUser(event){

        du.debug('Acquire User');

        if(!_.has(event.requestContext, "authorizer")){

            return Promise.reject(new Error('Unable to identify the authorizer property in the event request context.'));

        }

        if(!_.has(event.requestContext.authorizer, "user")){

            return Promise.reject(new Error('Unable to identify the user node in the event request context authorizer property.'));

        }

        let user_string = event.requestContext.authorizer.user;

        du.debug('Event Request Context Authorizer User Alias:', user_string);

        if(!_.isString(user_string)){

            return Promise.reject(new Error('Event request context authorizer user is an unrecognized format.'));

        }

        if(validator.isEmail(user_string)){

            return userController.getUserStrict(user_string).then((user) => {

                if(_.has(user, 'id')){

                    permissionutilities.setGlobalUser(user);

                    return event;

                }else if(user == false){

                    return new Error('Unknown user.  Please contact the system administrator.');

                }

            });

        }else{

            return userController.getUserByAlias(user_string).then((user) => {

                if(_.has(user, 'id')){

                    permissionutilities.setGlobalUser(user);

                    return event;

                }else if(user == false){

                    return new Error('Unknown user.  Please contact the system administrator.');

                }

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

                    return reject(new Error(error_string));

                }

                return resolve(event);

            }).catch((error) => {

                return reject(error);

            });

        });

    }

}
