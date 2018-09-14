
const _ = require('lodash');

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const CampaignController = global.SixCRM.routes.include('entities', 'Campaign.js');
const CustomerController = global.SixCRM.routes.include('entities', 'Customer.js');
const CustomerHelperController = global.SixCRM.routes.include('helpers', 'entities/customer/Customer.js');
const CustomerMailerHelper = global.SixCRM.routes.include('helpers', 'email/CustomerMailer.js');
const EmailTemplateController = global.SixCRM.routes.include('entities', 'EmailTemplate.js');
const SMTPProviderController = global.SixCRM.routes.include('entities', 'SMTPProvider.js');
const SNSEventController = global.SixCRM.routes.include('controllers','workers/components/SNSEvent.js');
const ActivityHelper = global.SixCRM.routes.include('helpers', 'analytics/Activity.js');
const handlebars = global.SixCRM.routes.include('helpers', 'emailtemplates/Handlebars.js');
const AccountDetailsController = global.SixCRM.routes.include('entities', 'AccountDetails.js');

module.exports = class EventEmailsController extends SNSEventController {

	constructor(){

		super();

		this.doSend = true;

		this.parameter_definition = {};

		this.parameter_validation = {
			'campaign':global.SixCRM.routes.path('model','entities/campaign.json'),
			'customer':global.SixCRM.routes.path('model','entities/customer.json'),
			'smtpproviders':global.SixCRM.routes.path('model','entities/components/smtpproviders.json'),
			'emailtemplates':global.SixCRM.routes.path('model','entities/components/emailtemplates.json')
		};

		this.eventMap = {
			'allorders': ['order'],
			'initialorders': ['order'],
			'decline': ['order_decline']
		};

		this.event_record_handler = 'triggerEmails';

		this.campaignController = new CampaignController();
		this.customerController = new CustomerController();
		this.smtpProviderController = new SMTPProviderController();
		this.emailTemplatesController = new EmailTemplateController();
		this.activityHelper = new ActivityHelper();
		this.accountDetailsController = new AccountDetailsController();

		this.smtpProviderController.sanitize(false);
		this.emailTemplatesController.sanitize(false);

		this.augmentParameters();

	}

	triggerEmails(){

		du.debug('Trigger Emails');

		return this.acquireCampaign()
			.then(() => this.acquireProducts())
			.then(() => this.acquireProductSchedules())
			.then(() => this.acquireCustomer())
			.then(() => this.acquireEmailTemplates())
			.then(() => this.acquireSMTPProvider())
			.then(() => this.acquireAccountDetails())
			.then(() => this.sendEmails())
			.then(() => this.createAnalyticsActivityRecord(``))
			.catch(error => {
				du.error('Email Sending Failed');
				du.error(error);

				let EventsHelperController = global.SixCRM.routes.include('helpers', 'events/Event.js');
				let eventHelperController = new EventsHelperController();

				let context = {smtp_provider: this.parameters.get('paired_smtp_provider')};

				return eventHelperController.pushEvent({event_type: 'email_fail', context: context}).then(result => {
					du.info(result);
					return;
				});

			});

	}

	acquireCampaign(){

		du.debug('Acquire Campaign');

		let message = this.parameters.get('message');

		du.debug(message);

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
			du.error(message.context);
			throw eu.getError('server', 'Unable to identify campaign');
		}

		return this.campaignController.get({id: campaign}).then(result => {
			this.parameters.set('campaign', result);
			du.debug(result);
			return true;
		});

	}

	acquireProducts() {
		du.debug('Acquire Products');

		let context = this.parameters.get('message').context || {};
		let products = [];

		if (context.products) {
			products = context.products;
		}

		if (_(context).has('order.products')) {
			products = context.order.products.map(p => p.product);
		}

		if (_(context).has('rebill.products')) {
			products = context.rebill.products.map(p => p.product);
		}

		this.parameters.set('products', products);
	}

	acquireProductSchedules() {
		du.debug('Acquire Product Schedules');

		let context = this.parameters.get('message').context || {};
		let product_schedules = [];

		if (context.product_schedules) {
			product_schedules = context.product_schedules;
		}

		if (_(context).has('rebill.product_schedules')) {
			product_schedules = context.rebill.product_schedules;
		}

		this.parameters.set('product_schedules', product_schedules);
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
			du.error(message.context);
			throw eu.getError('server', 'Unable to identify customer');
		}

		return this.customerController.get({id: customer}).then((result) => {
			this.parameters.set('customer', result);
			du.debug(result);
			return true;
		});

	}

	acquireEmailTemplates(){

		du.debug('Acquire Email Templates');

		let message = this.parameters.get('message');
		let campaign = this.parameters.get('campaign');
		let products = this.parameters.get('products');
		let product_schedules = this.parameters.get('product_schedules');
		let cycle = _(message).has('context.rebill.cycle') ? message.context.rebill.cycle : -1;

		du.debug(message, campaign, products, product_schedules);

		return this.emailTemplatesController.templatesByAccount({account: campaign.account}).then(results => {

			du.debug('account', message.account);
			du.debug('results', results);

			if(_.isNull(results) || !arrayutilities.nonEmpty(results)){
				du.debug('No email templates for account.');
				return [];
			}

			let associated_templates = [];

			results.forEach(template => {
				if (template.enabled === false) {
					du.debug(`Template ${template.id} is disabled.`);
					return;
				}

				if (template.campaigns && template.campaigns.includes(campaign.id)) {
					du.debug(`Adding template ${template.id} due to match with campaign ${campaign.id}.`);
					associated_templates.push(template)
				}

				products.forEach(product => {
					if (template.products && template.products.includes(product.id)) {
						du.debug(`Adding template ${template.id} due to match with product ${product.id}.`);
						associated_templates.push(template)
					}
				});

				product_schedules.forEach(product_schedule => {
					if (template.product_schedules && template.product_schedules.includes(product_schedule.id)) {
						du.debug(`Adding template ${template.id} due to match with product schedule ${product_schedule.id}.`);
						associated_templates.push(template)
					}
				});

				if (template.cycle === cycle) {
					du.debug(`Adding template ${template.id} due to match with cycle ${cycle}.`);
					associated_templates.push(template)
				}
			});

			return associated_templates.filter(result => {
				du.debug(`Does ${result.type} equal ${message.event_type}?`);
				return (result.type === message.event_type) || (this.areEventsCompatible(result.type, message.event_type));
			});

		}).then(results => {

			if(!_.isNull(results) && arrayutilities.nonEmpty(results)){
				du.debug('Found email templates.');
				this.parameters.set('emailtemplates', [...new Set(results)]);

				return true;
			}

			du.debug(`No email templates.`);
			return false;

		});

	}

	acquireSMTPProvider(){

		du.debug('Acquire SMTP Provider');

		let email_templates = this.parameters.get('emailtemplates', {fatal: false});

		if(!_.isNull(email_templates)){

			let smtp_provider_promises = arrayutilities.map(email_templates, email_template => {
				du.debug(`Getting SMTP provider for email template ${email_template.id}`);
				return this.emailTemplatesController.getSMTPProvider(email_template);
			});

			return Promise.all(smtp_provider_promises).then(results => {
				let smtp_providers = arrayutilities.filter(results, result => {
					return !_.isNull(result);
				});

				this.parameters.set('smtpproviders', smtp_providers);
				du.debug('Found SMTP provider(s)');
				return true;
			});

		}

		return true;

	}

	async acquireAccountDetails() {

		let campaign = this.parameters.get('campaign');

		du.debug('Get Account Details', campaign.account);

		const accountdetails = await this.accountDetailsController.get({ id: campaign.account });

		this.parameters.set('accountdetails', accountdetails);

		return Promise.resolve(accountdetails);

	}

	sendEmails(){

		du.debug('Send Emails');

		let email_templates  = this.parameters.get('emailtemplates', {fatal: false});

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

		if (this.doSend) {
			return customerEmailer.sendEmail({send_options: options})
		}

		return Promise.resolve();


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

		this.parameters.set('paired_smtp_provider', paired_smtp_provider);

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

		let context = this.createContext();

		du.debug('Context Is', context);

		let compiled_template_body = handlebars.compile(email_template.body);
		let compiled_template_subject = handlebars.compile(email_template.subject);
		let body = compiled_template_body(context);
		let subject = compiled_template_subject(context);

		return {
			subject, body
		};

	}

	createContext(){

		du.debug('Create Context');

		let context = this.parameters.get('message').context;
		context.campaign = this.parameters.get('campaign');
		context.customer = this.parameters.get(`customer`);
		context.accountdetails = this.parameters.get('accountdetails');

		return context;
	}

	areEventsCompatible(template_event, system_event) {

		du.debug('Are Events Compatible', template_event, system_event);

		if (!this.eventMap[template_event]) {
			du.debug('No');
			return false;
		}

		let compatible = this.eventMap[template_event].indexOf(system_event) > -1;
		du.debug('Are:', compatible);

		return compatible;
	}

	createAnalyticsActivityRecord(){

		let customer = this.parameters.get('customer');

		return this.activityHelper.createActivity(null, 'sent_email', {entity: customer, type: 'customer'}, null);

	}

};


