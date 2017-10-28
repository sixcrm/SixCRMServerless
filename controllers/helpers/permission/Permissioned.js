'use strict'
const _ = require('underscore');
const uuidV4 = require('uuid/v4');


const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');
const indexingutilities = global.SixCRM.routes.include('lib', 'indexing-utilities.js');
const cacheController = global.SixCRM.routes.include('controllers', 'providers/Cache.js');

module.exports = class PermissionedController {

  constructor(){

    this.permissionutilities = global.SixCRM.routes.include('lib', 'permission-utilities.js');

  }

  can({account, object, action, id, fatal}){

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
    eu.throwError('forbidden', 'Invalid Permissions: user does not have sufficient permission to perform this action');

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
