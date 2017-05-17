'use strict';
var SMTPProviderController = global.routes.include('controllers', 'entities/SMTPProvider.js');
var entityController = global.routes.include('controllers', 'entities/Entity.js');

class emailTemplateController extends entityController {

    constructor(){
        super(process.env.emails_keys_table, 'emailtemplate');
        this.table_name = process.env.email_templates_table;
        this.descriptive_name = 'emailtemplate';
    }

    getSMTPProvider(emailtemplate){

        return SMTPProviderController.get(emailtemplate.smtp_provider);

    }

}

module.exports = new emailTemplateController();
