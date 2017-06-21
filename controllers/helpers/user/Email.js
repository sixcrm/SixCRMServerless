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

    acquireRecipient(data){

        du.debug('Acquire Recipient');

        let customer = objectutilities.discover('customer', data);

        return this.customerController.get(customer);

    }

    sendEmail(event_type, data){

        du.debug('Send Email');

        let campaign = objectutilities.discover('campaign', data);

        if(_.isNull(campaign)){ return Promise.reject(new Error('Unable to identify a campaign.')); }

        return this.campaignController.get(campaign).then((campaign) => {

            if(_.isNull(campaign)){ return Promise.reject(new Error('Unable to identify a campaign.')); }

            return this.campaignController.getEmailTemplatesByEventType(campaign, event_type).then((email_templates) => {

                if(!_.isArray(email_templates) || email_templates.length < 1){ return Promise.resolve(null); }

                let email_template_promises;

                email_template_promises = email_templates.map((email_template) => {

                    return this.emailTemplateController.getSMTPProvider(email_template).then((smtp_provider) => {

                        let parsed_body = parserutilities.parse(email_template.body, data);

                        let parsed_subject = parserutilities.parse(email_template.subject, data);

                        return this.acquireRecipient(data).then((recepient) => {

                            let SMTPProviderInstance = new SMTPProvider(smtp_provider);

                          //Technical Debt:  Need to acquire the sender information from some data properties...
                            let send_object = {
                                sender_email: 'donotreply@sixcrm.com',
                                sender_name: 'SixCRM',
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
