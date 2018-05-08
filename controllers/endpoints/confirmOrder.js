const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const AnalyticsEvent = global.SixCRM.routes.include('helpers', 'analytics/analytics-event.js')

const SessionController = global.SixCRM.routes.include('entities', 'Session.js');
const transactionEndpointController = global.SixCRM.routes.include('controllers', 'endpoints/components/transaction.js');

const SessionHelperController = global.SixCRM.routes.include('helpers', 'entities/session/Session.js');
const CustomerHelperController = global.SixCRM.routes.include('helpers', 'entities/customer/Customer.js');
const OrderHelperController = global.SixCRM.routes.include('helpers', 'order/Order.js');

module.exports = class ConfirmOrderController extends transactionEndpointController {

	constructor() {

		super();

		this.required_permissions = [
			'user/read',
			'account/read',
			'session/create',
			'session/read',
			'session/update',
			'campaign/read',
			'creditcard/create',
			'creditcard/update',
			'creditcard/read',
			'productschedule/read',
			'merchantprovidergroup/read',
			'merchantprovidergroupassociation/read',
			'product/read',
			'affiliate/read',
			'transaction/read',
			'rebill/read',
			'notifications/create',
			'tracker/read'
		];

		this.notification_parameters = {
			type: 'session',
			action: 'closed',
			title: 'Completed Session',
			body: 'A customer has completed a session.'
		};

		this.parameter_definitions = {
			execute: {
				required: {
					event: 'event'
				}
			}
		};

		this.parameter_validation = {
			'event': global.SixCRM.routes.path('model', 'endpoints/confirmOrder/event.json'),
			'session': global.SixCRM.routes.path('model', 'entities/session.json'),
			'customer': global.SixCRM.routes.path('model', 'entities/customer.json'),
			'campaign': global.SixCRM.routes.path('model', 'entities/campaign.json'),
			'response': global.SixCRM.routes.path('model', 'endpoints/confirmOrder/response.json')
		};

		this.sessionHelperController = new SessionHelperController();
		this.sessionController = new SessionController();

		this.initialize();

	}

	execute(event) {

		du.debug('Execute');

		return this.preamble(event).then(() => this.confirmOrder(this.parameters.get('event')));

	}

	async confirmOrder(event) {

		du.debug('Confirm Order');

		let session = await this.hydrateSession(event);
		this.validateSession(session);

		let [customer, campaign, rebills] = await this.hydrateSessionProperties(session);

		await this.closeSession(session);
		const response = this.buildResponse(session, customer, rebills);
		await this.postProcessing(session, campaign);

		return response;

	}

	hydrateSession(event) { // returns session

		du.debug('Hydrate Session');

		return this.sessionController.get({ id: event.session });

	}

	validateSession(session) {

		du.debug('Validate Session');

		if (this.sessionHelperController.isComplete({	session: session })) {
			throw eu.getError('bad_request', 'The specified session is already complete.');
		}

	}

	hydrateSessionProperties(session) {

		du.debug('Hydrate Session Properties');

		return Promise.all([
			this.sessionController.getCustomer(session),
			this.sessionController.getCampaign(session),
			this.sessionController.listRebills(session)
		]);

	}

	getTransactionProducts(transactions) {

		du.debug('Get Transaction Products');

		return this.transactionHelperController.getTransactionProducts(transactions);

	}

	closeSession(session) {

		du.debug('Confirm Order');

		return this.sessionController.closeSession(session);

	}

	async buildResponse(session, customer, rebills) {

		du.debug('Build Response');

		let customerHelper = new CustomerHelperController();
		let sessionHelper = new SessionHelperController();
		let orderHelper = new OrderHelperController();

		let orders = arrayutilities.map(rebills, (rebill) => {
			return orderHelper.createOrder({rebill: rebill, session: session, customer: customer});
		});

		orders = await Promise.all(orders);

		return {
			session: sessionHelper.getPublicFields(session),
			customer: customerHelper.getPublicFields(customer),
			orders: orders
		};

	}

	postProcessing(session, campaign) {

		du.debug('Post Processing');

		return AnalyticsEvent.push('confirm', {
			session,
			campaign
		});

	}

}
