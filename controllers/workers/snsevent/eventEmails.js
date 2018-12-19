
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
const ProductHelperController = global.SixCRM.routes.include('helpers', 'entities/product/Product.js');
const EventsHelperController = global.SixCRM.routes.include('helpers', 'events/Event.js');


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
		this.productHelperController = new ProductHelperController();
		this.eventHelperController = new EventsHelperController();

		this.smtpProviderController.sanitize(false);
		this.emailTemplatesController.sanitize(false);

		this.augmentParameters();

	}

	triggerEmails(){
		return this.acquireCampaign()
			.then(() => this.hydrateContext())
			.then(() => this.acquireProducts())
			.then(() => this.acquireProductSchedules())
			.then(() => this.acquireCustomer())
			.then(() => this.acquireEmailTemplates())
			.then(() => this.acquireSMTPProvider())
			.then(() => this.acquireAccountDetails())
			.then(() => this.sendEmails())

	}

	acquireCampaign(){
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
			du.error(message.context);
			throw eu.getError('server', 'Unable to identify campaign');
		}

		return this.campaignController.get({id: campaign}).then(result => {
			this.parameters.set('campaign', result);
			return true;
		});

	}

	acquireProducts() {
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
			return true;
		});

	}

	async hydrateContext() {
		let context = this.parameters.get('message').context || {};

		if (_(context).has('rebill.products')) {
			for (let product of context.rebill.products) {
				if (!product.image) {
					product.image = this.productHelperController.getDefaultImage(product.product);
				}
			}
		}

		return Promise.resolve();
	}

	acquireEmailTemplates(){
		let message = this.parameters.get('message');
		let campaign = this.parameters.get('campaign');
		let products = this.parameters.get('products');
		let product_schedules = this.parameters.get('product_schedules');
		let cycle = _(message).has('context.rebill.cycle') ? message.context.rebill.cycle : -1;

		return this.emailTemplatesController.templatesByAccount({account: campaign.account}).then(results => {

			if(_.isNull(results) || !arrayutilities.nonEmpty(results)){
				return [];
			}

			let associated_templates = [];

			results.forEach(template => {
				if (template.enabled === false) {
					return;
				}

				if (template.campaigns && template.campaigns.includes(campaign.id)) {
					associated_templates.push(template)
				}

				products.forEach(product => {
					if (template.products && template.products.includes(product.id)) {
						associated_templates.push(template)
					}
				});

				product_schedules.forEach(product_schedule => {
					if (template.product_schedules && template.product_schedules.includes(product_schedule.id)) {
						associated_templates.push(template)
					}
				});

				if (template.cycle === cycle) {
					associated_templates.push(template)
				}
			});

			return associated_templates.filter(result => {
				return (result.type === message.event_type) || (this.areEventsCompatible(result.type, message.event_type));
			});

		}).then(results => {

			if(!_.isNull(results) && arrayutilities.nonEmpty(results)){
				this.parameters.set('emailtemplates', [...new Set(results)]);

				return true;
			}

			return false;

		});

	}

	acquireSMTPProvider(){
		let email_templates = this.parameters.get('emailtemplates', {fatal: false});

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

	async acquireAccountDetails() {

		let campaign = this.parameters.get('campaign');

		const accountdetails = await this.accountDetailsController.get({ id: campaign.account });

		if (!accountdetails.company_logo) {
			accountdetails.company_logo = this.accountDetailsController.getDefaultCompanyLogoPath();
		}

		this.parameters.set('accountdetails', accountdetails);

		return Promise.resolve(accountdetails);

	}

	sendEmails(){
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
				.catch(error => {
					du.error('Email Sending Failed', error);

					let context = {smtpprovider: paired_smtp_provider};

					return this.eventHelperController.pushEvent({event_type: 'email_fail', context: context})

				})
				.then(() => this.createAnalyticsActivityRecord(customer, email_template.type, parsed_email_template.subject))
		}

		return Promise.resolve();


	}

	getPairedSMTPProvider(email_template){
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
		let customer = this.parameters.get('customer');

		let customerHelperController = new CustomerHelperController();

		return customerHelperController.getFullName(customer);

	}

	parseEmailTemplate(email_template){
		let context = this.createContext();

		let compiled_template_body = handlebars.compile(email_template.body);
		let compiled_template_subject = handlebars.compile(email_template.subject);
		let body = compiled_template_body(context);
		let subject = compiled_template_subject(context);

		return {
			subject, body
		};

	}

	createContext(){
		let context = this.parameters.get('message').context;
		context.campaign = this.parameters.get('campaign');
		context.customer = this.parameters.get(`customer`);
		context.accountdetails = this.parameters.get('accountdetails');

		return context;
	}

	areEventsCompatible(template_event, system_event) {

		if (!this.eventMap[template_event]) {
			return false;
		}

		let compatible = this.eventMap[template_event].indexOf(system_event) > -1;

		return compatible;
	}

	createAnalyticsActivityRecord(customer, email_type, subject) {

		return this.activityHelper.createActivity(null, 'sent_email', {
			entity: customer,
			type: 'customer'
		}, {email: {type: email_type, subject}});

	}

};


