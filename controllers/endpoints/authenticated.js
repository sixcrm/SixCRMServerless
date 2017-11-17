'use strict';
const _ = require("underscore");

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const permissionutilities = global.SixCRM.routes.include('lib', 'permission-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

const endpointController = global.SixCRM.routes.include('controllers', 'endpoints/endpoint.js');

module.exports = class AuthenticatedController extends endpointController {

    constructor(parameters){

      super();

      if(_.has(parameters, 'required_permissions')){

        //Technical Debt: totally unnecessary, refactor.
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

    //Technical Debt:  This is wrought with redundancies....
    acquireUser(event){

      du.debug('Acquire User');

      objectutilities.hasRecursive(event, 'requestContext.authorizer.user', true);

      let user_string = event.requestContext.authorizer.user;

      du.debug('Event Request Context Authorizer User Alias:', user_string);

      if(!_.isString(user_string)){

        eu.throwError('server','Event request context authorizer user is an unrecognized format.');

      }

      if(this.userController.isEmail(user_string)){

        return this.userController.getUserStrict(user_string).then((user) => {

          if(_.has(user, 'id')){

            //Technical Debt:  This should use the global configuration object
            permissionutilities.setGlobalUser(user);

          }else if(user == false){

            if(!this.isUserIntrospection(event) && !this.isAcceptInvite(event)) {
              eu.throwError('forbidden', 'Unknown user.  Please contact the system administrator.');
            }

            du.warning('Unable to acquire user, setting global user to email.');

            //Technical Debt:  This should use the global configuration object
            permissionutilities.setGlobalUser(user_string);

          }

          return event;

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

    //Technical Debt:  THis function does not need to return a promise...
    //Technical Debt:  Refactor, this is gross...
    validateRequiredPermissions(event){

      du.debug('Validate Required Permissions');

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

      if(_.contains(validated_permissions, false)){

        eu.throwError('fobidden', 'Unable to execute action.  User lacks permission.');

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

    isAcceptInvite(event) {

      du.debug('Is Accept Invite', event.body);

      if(_.has(event, 'body') && event.body.match(/^[\s\n\r]*(mutation)?[\s\n\r]*{[\s\n\r]*acceptinvite[\s\n\r]/)) {
        return true;
      }

      return false;

    }

}
