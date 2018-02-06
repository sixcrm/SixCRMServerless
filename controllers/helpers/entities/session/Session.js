'use strict'
const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

module.exports = class SessionHelperController {

  constructor(){

    this.parameter_definition = {};

    this.parameter_validation = {};

    const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');

    this.parameters = new Parameters({validation: this.parameter_validation, definition: this.parameter_definition});

  }

  getSessionByCustomerAndID({customer, id}){

    du.debug('Get Session By Customer and ID');

    if(!_.has(this, 'sessionController')){
      this.sessionController = global.SixCRM.routes.include('controllers', 'entities/Session.js');
    }

    return this.sessionController.get({id:id}).then(session => {

      if(_.isNull(session)){ return null; }

      return this.sessionController.getCustomer(session).then(customer_result => {

        if(_.has(customer_result, 'email') && (customer == customer_result.email)){ return session; }

        return null;

      });

    });

  }

}
