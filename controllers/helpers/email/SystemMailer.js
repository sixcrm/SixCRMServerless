'use strict';
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const modelvalidatorutilities = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');

//Technical Debt:  Validate, write tests.
//Technical Debt:  Integrate

module.exports = class SystemMailer{

    constructor(){

      this.instantiateSMTPProvider();

    }

    sendEmail(parameters){

      du.debug('Send Email');

      parameters = this.assureOptionalParameters(parameters);

      this.validateParameters(parameters);

      return this.send(parameters);

    }

    validateParameters(parameters){

      du.debug('Validate Parameters');

      return modelvalidatorutilities.validateModel(parameters, global.SixCRM.routes.path('model', 'general/smtp_send_object.json'));

    }

    assureOptionalParameters(parameters){

      du.debug('Assure Optional Parameters');

      arrayutilities.map(['sender_email', 'sender_name'], (optional_parameter) => {
        if(!_.has(parameters, optional_parameter)){
          if(objectutilities.hasRecursive(global, 'SixCRM.configuration.site_config.ses.default_'+optional_parameter)){
            parameters[optional_parameter] = global.SixCRM.configuration.site_config.ses['default_'+optional_parameter];
          }
        }
      });

      return parameters;

    }

    send(parameters){

      du.debug('Send');

      this.instantiateSMTPProvider();

      return this.smtpprovider.send(parameters);

    }

    instantiateSMTPProvider(){

      du.debug('Instantiate SMTP Utilities');

      if(!_.has(this, 'smtpprovider')){

        let smtp_options = this.createSMTPOptions();

        let SMTPProvider = global.SixCRM.routes.include('lib', 'providers/smtp-provider.js');

        this.smtpprovider = new SMTPProvider(smtp_options);

      }

    }

    createSMTPOptions(){

      du.debug('Create SMTP Options');

      return {
        hostname: global.SixCRM.configuration.site_config.ses.hostname,
        username: global.SixCRM.configuration.site_config.ses.smtp_username,
        password: global.SixCRM.configuration.site_config.ses.smtp_password,
        port: global.SixCRM.configuration.site_config.ses.port
      };

    }

}

