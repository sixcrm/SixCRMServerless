'use strict';

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');

module.exports = class CustomerMailerHelper{

  constructor(){

    this.parameter_definitions = {
      'constructor':{
        required:{
          smtpprovider:'smtp_provider'
        },
        optional:{}
      }
    };

    this.parameter_validation = {
      'smtpprovider':global.SixCRM.routes.path('model', 'entities/smtpprovider.json')
    };

    this.parameters = new Parameters({validation: this.parameter_validation, definitions: this.parameter_defintion});
    this.parameters.setParameters({argumentation: arguments[0], action: 'constructor'});

    this.instantiate();

  }

  instantiate(){

    du.debug('Instantiate');

    //instantiate
  }

  sendEmail(email_options){

    du.info(email_options);
    du.debug('Send Email');

    //send

  }

}
