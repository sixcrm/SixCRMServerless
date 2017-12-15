'use strict';
const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

//Technical Debt: Override the list method
class userSigningStringController extends entityController {

  constructor() {
      super('usersigningstring');
  }

  create({entity: entity}){

    du.debug('User Signing String Controller: Create');

    const userSigningStringHelperController = global.SixCRM.routes.include('helpers', 'entities/usersigningstring/UserSigningString.js');

    if(!_.has(entity, 'signing_string')){
      entity.signing_string = userSigningStringHelperController.generateSigningString();
    }

    return super.create({entity: entity});

  }

  update({entity: entity}){

    du.debug('User Signing String Controller: Update');

    return this.get({id: this.getID(entity)}).then(existing_user_signing_string => {

      if(objectutilities.isObject(existing_user_signing_string)){
        entity = objectutilities.transcribe({signing_string: 'signing_string'}, existing_user_signing_string, entity, false);
      }

      return super.update({entity: entity});

    });

  }

}

module.exports = new userSigningStringController();
