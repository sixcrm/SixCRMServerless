'use strict'
const  _ = require('underscore');

const du = global.routes.include('lib', 'debug-utilities.js');
const objectutilities = global.routes.include('lib', 'object-utilities.js');
const parserutilities = global.routes.include('lib', 'parser-utilities.js');
const SMTPProvider = global.routes.include('controllers', 'providers/SMTP.js');

module.exports = class userEmailHelperController {

    constructor(){

        this.campaignController = global.routes.include('entities','Campaign.js');
        this.emailTemplateController = global.routes.include('entities','EmailTemplate.js');
        this.customerController = global.routes.include('entities','Customer.js');

    }

    getRecipient(data){

        du.debug('Acquire Recipient');

        let customer = objectutilities.recurse(data, function(key, value){
            if(key == 'customer' && value !== 'customer'){
                return true;
            }
            return false;
        });

        if(_.isNull(customer)){ return Promise.reject(new Error('Unable to get recepient.')); }

        return this.customerController.get(customer);

    }

    getCampaign(data){

        du.debug('Get Campaign');

        let campaign = objectutilities.recurse(data, function(key, value){
            if(key == 'campaign' && value !== 'campaign'){
                return true;
            }
            return false;
        });

        if(_.isNull(campaign)){ return Promise.reject(new Error('Unable to get campaign.')); }

        return this.campaignController.get(campaign);

    }

    sendEmail(event_type, data){

        du.debug('Send Email');

        return this.getCampaign(data).then((campaign) => {

            if(_.isNull(campaign)){ return Promise.reject(new Error('Unable to identify a campaign.')); }

            return this.campaignController.getEmailTemplatesByEventType(campaign, event_type).then((email_templates) => {

                if(!_.isArray(email_templates) || email_templates.length < 1){ return Promise.resolve(null); }

                let email_template_promises;

                email_template_promises = email_templates.map((email_template) => {

                    return this.emailTemplateController.getSMTPProvider(email_template).then((smtp_provider) => {

                        let parsed_body = parserutilities.parse(email_template.body, data);

                        let parsed_subject = parserutilities.parse(email_template.subject, data);

                        //Technical Debt:  These default properties should be configured...
                        let sender_email = (_.has(smtp_provider, 'from_email'))?smtp_provider.from_email:'donotreply@sixcrm.com';

                        let sender_name = (_.has(smtp_provider, 'from_name'))?smtp_provider.from_name:'SixCRM';

                        return this.getRecipient(data).then((recepient) => {

                            let SMTPProviderInstance = new SMTPProvider(smtp_provider);

                            let send_object = {
                                sender_email: sender_email,
                                sender_name: sender_name,
                                subject: parsed_subject,
                                body: parsed_body,
                                recepient_emails: [recepient.email],
                                recepient_name: this.customerController.getFullName(recepient)
                            };

                            return SMTPProviderInstance.send(send_object);

                        });

                    });

                });

                return Promise.all(email_template_promises).then((email_template_promises) => {

                    du.info(email_template_promises);

                    return data;

                });

            });

        });

    }

}
