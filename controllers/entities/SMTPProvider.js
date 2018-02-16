'use strict';
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib','debug-utilities.js');
const eu = global.SixCRM.routes.include('lib','error-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib','array-utilities.js');

var entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

class SMTPProviderController extends entityController {

    constructor(){

        super('smtpprovider');

        this.search_fields = ['name'];

    }

    associatedEntitiesCheck({id}){

      du.debug('Associated Entities Check');

      let return_array = [];

      let data_acquisition_promises = [
        this.executeAssociatedEntityFunction('emailTemplateController', 'listBySMTPProvider', {smtpprovider:id})
      ];

      return Promise.all(data_acquisition_promises).then(data_acquisition_promises => {

        let emailtemplates = data_acquisition_promises[0];

        if(_.has(emailtemplates, 'emailtemplates') && arrayutilities.nonEmpty(emailtemplates.emailtemplates)){
          arrayutilities.map(emailtemplates.emailtemplates, (emailtemplate) => {
            return_array.push(this.createAssociatedEntitiesObject({name:'Email Template', object: emailtemplate}));
          });
        }

        return return_array;

      });

    }

    validateSMTPProvider({email, smtpprovider}){

      du.debug('Validate SMTP Provider');

      return this.get({id: smtpprovider}).then(smtpprovider => {

        if(_.isNull(smtpprovider)){
          eu.throwError('notfound', 'The SMTP Provider specified was not found.');
        }

        const SMTPProviderProvider = global.SixCRM.routes.include('providers', 'SMTP.js');
        let smtp = new SMTPProviderProvider(smtpprovider);

        let send_object = {
          sender_email: global.SixCRM.configuration.site_config.ses.default_sender_email,
          sender_name: global.SixCRM.configuration.site_config.ses.default_sender_name,
          subject:"Testing SMTP Provider",
          body:  "This is a test of the SMTP provider ID :"+smtpprovider.id,
          recepient_emails:[email]
        };

        return smtp.send(send_object).then(smtp_response => {

          return {
            send_properties: send_object,
            smtp_response:smtp_response,
            smtpprovider: smtpprovider
          };

        }).catch(error => {

          return {
            send_properties: send_object,
            smtp_response: {errormessage: error.message, error: error},
            smtpprovider: smtpprovider
          };

        });

      });

    }

}

module.exports = new SMTPProviderController();
