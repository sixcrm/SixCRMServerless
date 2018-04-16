
const _ = require('lodash');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const parserutilities = global.SixCRM.routes.include('lib', 'parser-utilities.js');
const CampaignController = global.SixCRM.routes.include('entities', 'Campaign.js');
const CustomerController = global.SixCRM.routes.include('entities', 'Customer.js');
const CustomerHelperController = global.SixCRM.routes.include('helpers', 'entities/customer/Customer.js');
const CustomerMailerHelper = global.SixCRM.routes.include('helpers', 'email/CustomerMailer.js');
const EmailTemplateController = global.SixCRM.routes.include('entities', 'EmailTemplate.js');
const SMTPProviderController = global.SixCRM.routes.include('entities', 'SMTPProvider.js');
const SNSEventController = global.SixCRM.routes.include('controllers','workers/components/SNSEvent.js');

module.exports = class EventEmailsController extends SNSEventController {

	constructor(){

		super();

		this.parameter_definition = {};

		this.parameter_validation = {
			'campaign':global.SixCRM.routes.path('model','entities/campaign.json'),
			'customer':global.SixCRM.routes.path('model','entities/customer.json'),
			'smtpproviders':global.SixCRM.routes.path('model','entities/components/smtpproviders.json'),
			'emailtemplates':global.SixCRM.routes.path('model','entities/components/emailtemplates.json')
		};

		this.event_record_handler = 'triggerEmails';

		this.campaignController = new CampaignController();
		this.customerController = new CustomerController();
		this.smtpProviderController = new SMTPProviderController();
		this.emailTemplatesController = new EmailTemplateController();

		this.smtpProviderController.sanitize(false);
		this.emailTemplatesController.sanitize(false);

		this.augmentParameters();

	}

	triggerEmails(){

		du.debug('Trigger Emails');

		return this.acquireCampaign()
			.then(() => this.acquireCustomer())
			.then(() => this.acquireEmailTemplates())
			.then(() => this.acquireSMTPProvider())
			.then(() => this.sendEmails())
			.catch(error => {
				du.error(error);
				return true;
			});

	}

	acquireCampaign(){

		du.debug('Acquire Campaign');

		let message = this.parameters.get('message');

		let campaign = objectutilities.recurseByDepth(message.context, (key, value) => {

			if(key == 'campaign'){
				if(_.isObject(value) && _.has(value, 'id')){
					return true;
				}
				if(_.isString(value) && this.campaignController.isUUID(value)){
					return true;
				}
			}

			return false;

		});

		if(_.isUndefined(campaign) || _.isNull(campaign)){
			throw eu.getError('server', 'Unable to identify campaign');
		}

		return this.campaignController.get({id: campaign}).then(result => {
			this.parameters.set('campaign', result);
			return true;
		});

	}

	acquireCustomer(){

		du.debug('Acquire Customer');

		let message = this.parameters.get('message');

		let customer = objectutilities.recurseByDepth(message.context, (key, value) => {

			if(key == 'customer'){
				if(_.isObject(value) && _.has(value, 'id')){
					return true;
				}
				if(_.isString(value) && this.customerController.isUUID(value)){
					return true;
				}
			}

			return false;

		});

		if(_.isUndefined(customer) || _.isNull(customer)){
			throw eu.getError('server', 'Unable to identify customer');
		}

		return this.customerController.get({id: customer}).then((result) => {
			this.parameters.set('customer', result);
			return true;
		});

	}

	acquireEmailTemplates(){

		du.debug('Acquire Email Templates');

		let message = this.parameters.get('message');
		let campaign = this.parameters.get('campaign');

		return this.campaignController.getEmailTemplates(campaign).then(results => {

			if(_.isNull(results) || !arrayutilities.nonEmpty(results)){
				return true;
			}

			let email_templates = arrayutilities.filter(results, result => {
				return result.type == message.event_type;
			});

			return email_templates;

		}).then(results => {

			if(!_.isNull(results) && arrayutilities.nonEmpty(results)){
				this.parameters.set('emailtemplates', results);
				return true;
			}

			return false;

		});

	}

	acquireSMTPProvider(){

		du.debug('Acquire SMTP Provider');

		let email_templates = this.parameters.get('emailtemplates', null, false);

		if(!_.isNull(email_templates)){

			let smtp_provider_promises = arrayutilities.map(email_templates, email_template => {
				return this.emailTemplatesController.getSMTPProvider(email_template);
			});

			return Promise.all(smtp_provider_promises).then(results => {
				let smtp_providers = arrayutilities.filter(results, result => {
					return !_.isNull(result);
				});

				this.parameters.set('smtpproviders', smtp_providers);
				return true;
			});

		}

		return true;

	}

	sendEmails(){

		du.debug('Send Emails');



		let email_templates  = this.parameters.get('emailtemplates', null, false);

		if(_.isNull(email_templates) || !arrayutilities.nonEmpty(email_templates)){
			du.warning('No pertinent email templates.');
			return true;
		}

		let email_promises = arrayutilities.map(email_templates, email_template => {
			return this.sendEmail(email_template);
		});

		return Promise.all(email_promises).then(() => {
			return true;
		});

	}

	sendEmail(email_template){

		du.debug('Send Email');

		let customer = this.parameters.get('customer');
		let paired_smtp_provider = this.getPairedSMTPProvider(email_template);
		let parsed_email_template = this.parseEmailTemplate(email_template);

		let options = {
			sender_email: paired_smtp_provider.from_email,
			sender_name: paired_smtp_provider.from_name,
			subject: parsed_email_template.subject,
			body: parsed_email_template.body,
			recepient_emails:[customer.email],
			recepient_name: this.createCustomerFullName()
		};

		let customerEmailer = new CustomerMailerHelper({smtp_provider: paired_smtp_provider});

		return customerEmailer.sendEmail({send_options: options})

	}

	getPairedSMTPProvider(email_template){

		du.debug('Get Paired SMTP Provider');

		let smtp_providers = this.parameters.get('smtpproviders');

		let paired_smtp_provider = arrayutilities.find(smtp_providers, smtp_provider => {
			return (email_template.smtp_provider == smtp_provider.id);
		});

		if(_.isUndefined(paired_smtp_provider) || _.isNull(paired_smtp_provider)){
			throw eu.getError('server', 'No SMTP provider configured for use with email template: '+email_template.id);
		}

		return paired_smtp_provider;

	}

	createCustomerFullName(){

		du.debug('Create Customer Full Name');

		let customer = this.parameters.get('customer');

		let customerHelperController = new CustomerHelperController();

		return customerHelperController.getFullName(customer);

	}

	parseEmailTemplate(email_template){

		du.debug('Parse Email Template');

		let parse_object = this.createParseObject();

		return {
			subject: parserutilities.parse(email_template.subject, parse_object),
			body: parserutilities.parse(email_template.body, parse_object)
		};

	}

	createParseObject(){

		du.debug('Create Parse Object');

		let parse_object = {
			campaign: this.parameters.get('campaign'),
			customer: this.parameters.get('customer')
		}

		let optional_properties = {
			rebill: null,
			transactions: null,
			transaction: null,
			creditcard:null,
			session: null
		}

		let message = this.parameters.get('message');

		objectutilities.map(optional_properties, optional_property => {
			optional_properties[optional_property] = objectutilities.recurseByDepth(message.context, (key) => {
				return (key == optional_property);
			});
		});

		return objectutilities.merge(parse_object, optional_properties);

	}

}
