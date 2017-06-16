'use strict'
const du =  global.routes.include('lib', 'debug-utilities.js');

//const SMTPProvider = global.routes.include('controllers', 'providers/SMTP.js');

class userEmailHelperController {

    contructor(){

        this.campaignController = global.routes.include('controllers','Campaign.js');

    }

  /*
  sendEmail(event, campaign, data){

    return this.campaignController.get(campaign).then((campaign) => {

      let email_template_promises = [];

      return campaignController.getEmailTemplatesByEvent(campaign, event).then((email_templates) => {

        email_template_promises.push(email_templates.forEach((email_template) => {

            return this.emailTemplateController.getSMTPProvider(email_template).then((smtp_provider) => {

              let smtp_provider = new SMTPProvider({});

              let parsed_body = this.parserutilities.parse(email_template.body, data);

              let parsed_subject = this.parserutilities.parse(email_template.subject, data);

              let recepient = this.acquireRecipient(data);

              return smtp_provider.send({
                subject: parsed_subject,
                body: parsed_body,
                recepient_email: recepient.email,
                recepient_name: recepient.name
              });

            });

        });

      });

    });

  }
  */

}
