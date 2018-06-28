
const  _ = require('lodash');

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const parserutilities = require('@6crm/sixcrmcore/util/parser-utilities').default;
//Technical Debt:  Deprecated:  Use SystemMailer
const SMTPProvider = global.SixCRM.routes.include('controllers', 'providers/SMTP.js');
const CustomerHelperController = global.SixCRM.routes.include('helpers','entities/customer/Customer.js');
const CampaignController = global.SixCRM.routes.include('entities','Campaign.js');
const CustomerController = global.SixCRM.routes.include('entities','Customer.js');
const EmailTemplateController = global.SixCRM.routes.include('entities','EmailTemplate.js');

module.exports = class userEmailHelperController {

	constructor(){

		this.campaignController = new CampaignController();
		this.emailTemplateController = new EmailTemplateController();
		this.customerController = new CustomerController();
		this.customerHelperController = new CustomerHelperController();

	}

	getRecipient(data){

		du.debug('Acquire Recipient');

		let customer = objectutilities.recurse(data, function(key, value){
			if(key == 'customer' && value !== 'customer'){
				return true;
			}
			return false;
		});

		if(_.isNull(customer)){ return Promise.reject(eu.getError('not_found','Unable to get recepient.')); }

		return this.customerController.get({id: customer});

	}

	getCampaign(data){

		du.debug('Get Campaign');

		let campaign = objectutilities.recurse(data, function(key, value){
			if(key == 'campaign' && value !== 'campaign'){
				return true;
			}
			return false;
		});

		if(_.isNull(campaign)){ return Promise.reject(eu.getError('not_found','Unable to get campaign.')); }

		return this.campaignController.get({id: campaign});

	}

	sendEmail(event_type, data){

		du.debug('Send Email');

		return this.getCampaign(data).then((campaign) => {

			if(_.isNull(campaign)){ return Promise.reject(eu.getError('not_found','Unable to identify a campaign.')); }

			return this.campaignController.getEmailTemplatesByEventType(campaign, event_type).then((email_templates) => {

				if(!_.isArray(email_templates) || email_templates.length < 1){ return Promise.resolve(null); }

				let email_template_promises;

				email_template_promises = email_templates.map((email_template) => {

					//Technical Debt:  Deprecated. Use SystemMailer
					return this.emailTemplateController.getSMTPProvider(email_template).then((smtp_provider) => {

						let parsed_body = parserutilities.parse(email_template.body, data);

						let parsed_subject = parserutilities.parse(email_template.subject, data);

						//Technical Debt:  These default properties should be configured...
						let sender_email = (_.has(smtp_provider, 'from_email'))?smtp_provider.from_email:'donotreply@'+global.SixCRM.configuration.getDomain();

						let sender_name = (_.has(smtp_provider, 'from_name'))?smtp_provider.from_name:global.SixCRM.configuration.site_config.name;

						return this.getRecipient(data).then((recepient) => {

							let SMTPProviderInstance = new SMTPProvider(smtp_provider);

							let send_object = {
								sender_email: sender_email,
								sender_name: sender_name,
								subject: parsed_subject,
								body: parsed_body,
								recepient_emails: [recepient.email],
								recepient_name: this.customerHelperController.getFullName(recepient)
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
