'use strict';
const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

var entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

class emailTemplateController extends entityController {

    constructor(){

        super('emailtemplate');

        this.SMTPProviderController = global.SixCRM.routes.include('controllers', 'entities/SMTPProvider.js');

    }

    getSMTPProvider(emailtemplate){

        du.debug('Get SMTP Provider');

        if(_.has(emailtemplate, 'smtp_provider')){

            return this.SMTPProviderController.get(emailtemplate.smtp_provider);

        }else{

            return Promise.resolve(null);

        }

    }

}

module.exports = new emailTemplateController();
