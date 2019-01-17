const _ = require('lodash');
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const CampaignController = global.SixCRM.routes.include('entities', 'Campaign.js');
const CustomerController = global.SixCRM.routes.include('entities', 'Customer.js');
const SessionController = global.SixCRM.routes.include('entities', 'Session.js');
const AffiliateHelperController = global.SixCRM.routes.include('helpers', 'entities/affiliate/Affiliate.js');
const AnalyticsEvent = global.SixCRM.routes.include('helpers', 'analytics/analytics-event.js')
const SessionHelperController = global.SixCRM.routes.include('helpers', 'entities/session/Session.js');

const transactionEndpointController = global.SixCRM.routes.include('controllers', 'endpoints/components/transaction.js');


module.exports = class CreateLeadController extends transactionEndpointController {

	constructor() {
		super();

		this.required_permissions = [
			'user/read',
			'usersetting/read',
			'account/read',
			'customer/read',
			'customer/create',
			'customer/update',
			'session/create',
			'session/update',
			'session/read',
			'campaign/read',
			'affiliate/read',
			'affiliate/create',
			'notification/create',
			'notificationsetting/read',
			'tracker/read',
			'emailtemplate/read',
			'smtpprovider/read'
		];

		this.parameter_definitions = {
			execute: {
				required: {
					event: 'event'
				}
			}
		};

		this.parameter_validation = {
			'event': global.SixCRM.routes.path('model', 'endpoints/createLead/event.json'),
			'customer': global.SixCRM.routes.path('model', 'entities/customer.json'),
			'affiliates': global.SixCRM.routes.path('model', 'endpoints/components/affiliates.json'),
			'campaign': global.SixCRM.routes.path('model', 'entities/campaign.json'),
			'session_prototype': global.SixCRM.routes.path('model', 'endpoints/createLead/sessionprototype.json'),
			'session': global.SixCRM.routes.path('model', 'entities/session.json'),
		};

		this.campaignController = new CampaignController();
		this.customerController = new CustomerController();
		this.sessionController = new SessionController();
		this.affiliateHelperController = new AffiliateHelperController();
		this.sessionHelperController = new SessionHelperController();

		this.initialize();

	}

	execute(event) {
		return this.preamble(event)
			.then(() => this.createLead(this.parameters.get('event')));

	}

	async createLead(event) {
		let [customer, campaign, affiliates] = await this.getLeadProperties(event);
		let session_prototype = this.createSessionPrototype(customer, campaign, affiliates);
		let session = await this.assureSession(session_prototype);
		await this.triggerSessionCloseStateMachine(session);
		await this.postProcessing(session, campaign, affiliates, customer);

		return this.sessionHelperController.getPublicFields(session);

	}

	getLeadProperties(event) {
		return Promise.all([
			this.getCustomer(event),
			this.getCampaign(event),
			this.getAffiliates(event)
		]);

	}

	getCampaign(event) {
		return this.campaignController.get({ id: event.campaign });

	}

	getAffiliates(event) {
		return this.affiliateHelperController.handleAffiliateInformation(event).then(result => {

			return result.affiliates;

		});

	}

	getCustomer(event) {
		return this.customerController.getCustomerByEmail(event.customer.email).then((customer) => {

			if (_.has(customer, 'id')) {
				return customer;
			}
			else {
				return this.customerController.create({ entity: event.customer });
			}

		});

	}

	//Technical Debt:  Session Helper!
	createSessionPrototype(customer, campaign, affiliates) {
		let session_prototype = {
			customer: customer.id,
			campaign: campaign.id,
			completed: false
		};

		if (affiliates) {
			session_prototype = objectutilities.merge(session_prototype, affiliates);
		}

		return session_prototype;

	}

	assureSession(session_prototype) {
		//Technical Debt: test this 100%
		return this.sessionController.assureSession(session_prototype);

	}

	postProcessing(session, campaign, affiliates, customer) {
		return Promise.all(
			[
				this.pushEvent({event_type: 'lead', context: {
					customer: customer,
					campaign: campaign
				}}),
				AnalyticsEvent.push('lead', {
					session,
					campaign,
					affiliates
				})
			]
		);

	}

}
