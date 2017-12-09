'use strict';
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities');
const eu = global.SixCRM.routes.include('lib', 'error-utilities');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

var entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

class billController extends entityController {

  constructor(){

    super('bill');

  }

  update({entity}){

    du.debug('Update');

    if(this.isMasterAccount()){
      return super.update(arguments[0]);
    }

    eu.throwError('forbidden');

  }

  create({entity}){

    du.debug('Create');

    if(this.isMasterAccount()){
      return super.create(arguments[0]);
    }

    eu.throwError('forbidden');

  }

  updatePaidResult({entity}){

    du.debug('Update Paid Result');

    return super.update({entity: entity});

  }

}

module.exports = new billController();
