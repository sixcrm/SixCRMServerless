'use strict';
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib','debug-utilities.js');
const eu = global.SixCRM.routes.include('lib','error-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib','array-utilities.js');

var entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

class SMTPProviderController extends entityController {

    constructor(){

        super('smtpprovider');

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

}

module.exports = new SMTPProviderController();
