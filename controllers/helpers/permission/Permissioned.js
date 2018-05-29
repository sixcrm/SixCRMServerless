
const _ = require('lodash');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

module.exports = class PermissionedController {

	constructor(){

		this.permissionutilities = global.SixCRM.routes.include('lib', 'permission-utilities.js');

	}

	can({ object, action, fatal}){

		du.debug('Can');

		fatal = (_.isUndefined(fatal))?false:fatal;

		//Technical Debt:  Introduce account and ID
		return Promise.resolve(this.permissionutilities.validatePermissions(action, object)).then(permission => {

			if(permission == false && fatal == true){

				this.throwPermissionsError();

			}

			return permission;

		});

	}

	throwPermissionsError(){

		du.debug('Throw Permissions Error');

		//Technical Debt:  Embellish this message
		throw eu.getError('forbidden', 'Invalid Permissions: user does not have sufficient permission to perform this action.');

	}

	disableACLs(){

		du.debug('Disable ACLs');

		this.permissionutilities.disableACLs();

		return;

	}

	enableACLs(){

		du.debug('Enable ACLs');

		this.permissionutilities.enableACLs();

		return;

	}

	setGlobalUser(user){

		du.debug('Set Global User');

		if(_.has(user, 'id') || this.isEmail(user)){

			this.permissionutilities.setGlobalUser(user);

		}

		return;

	}

	setGlobalCustomer(customer){

		du.debug('Set Global Customer');

		if(_.has(customer, 'id')){

			this.permissionutilities.setGlobalCustomer(customer);

		}

		return;

	}

	unsetGlobalUser(){

		du.debug('Unset Global User');

		this.permissionutilities.unsetGlobalUser();

		return;

	}

	isMasterAccount(){

		du.debug('Is Master Account');

		return this.permissionutilities.isMasterAccount();

	}

	accountFilterDisabled(){

		du.debug('Account Filter Disabled');

		return this.permissionutilities.accountFilterDisabled()

	}

	/*
  Technical Debt:  Re-implement Caching
  createCanCacheKeyObject(action, entity){

      let user = this.getID(this.acquireGlobalUser());

      let account = this.acquireGlobalAccount();

      return {
          user: user,
          account: account,
          action: action,
          entity: entity
      };

  }
  */

	/*
  Deprecated version for reference
  can(action, fatal){

    du.debug('Can');

    //fatal = (_.isUndefined(fatal))?false:fatal;

    //let permission_utilities_state = JSON.stringify(this.permissionutilities.getState());

    //let question = permission_utilities_state+this.permissionutilities.buildPermissionString(action, this.descriptive_name);


    return Promise.resolve(this.permissionutilities.validatePermissions(action, this.descriptive_name)).then(permission => {

      if(permission == false && fatal == true){

        this.throwPermissionsError();

      }

      du.info('Can '+action+' on '+this.descriptive_name+': '+permission);

      return permission;

    });

    let answer_function = () => {

      let permission = this.permissionutilities.validatePermissions(action, this.descriptive_name);

      if(permission !== true){

        if(fatal == true){

          this.throwPermissionsError(action);

        }

        return false;

      }

      return permission;

    }

    return global.SixCRM.localcache.resolveQuestion(question, answer_function);

  }

  */

}
