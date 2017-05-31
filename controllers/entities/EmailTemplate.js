'use strict';
var SMTPProviderController = global.routes.include('controllers', 'entities/SMTPProvider.js');
var entityController = global.routes.include('controllers', 'entities/Entity.js');

class emailTemplateController extends entityController {

    constructor(){
        super('emailtemplate');
    }

    getSMTPProvider(emailtemplate){

        return SMTPProviderController.get(emailtemplate.smtp_provider);

    }

}

module.exports = new emailTemplateController();
