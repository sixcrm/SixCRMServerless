const _ = require('lodash');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const transactionEndpointController = global.SixCRM.routes.include('controllers', 'endpoints/components/transaction.js');
const SessionController = global.SixCRM.routes.include('entities', 'Session.js');
const SessionHelperController = global.SixCRM.routes.include('helpers', 'entities/session/Session.js');
const CustomerController = global.SixCRM.routes.include('entities', 'Customer.js');
const CreditCardHelperController = global.SixCRM.routes.include('helpers', 'entities/creditcard/CreditCard.js');
const CreditCardController = global.SixCRM.routes.include('entities', 'CreditCard.js');
const CampaignController = global.SixCRM.routes.include('entities', 'Campaign.js');
const RebillController = global.SixCRM.routes.include('controllers', 'entities/Rebill.js');
const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
const RebillCreatorHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/RebillCreator.js');
const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
const TransactionHelperController = global.SixCRM.routes.include('helpers', 'entities/transaction/Transaction.js');
const MerchantProviderSummaryHelperController = global.SixCRM.routes.include('helpers', 'entities/merchantprovidersummary/MerchantProviderSummary.js');
const OrderHelperController = global.SixCRM.routes.include('helpers', 'order/Order.js');
const AnalyticsEvent = global.SixCRM.routes.include('helpers', 'analytics/analytics-event.js')

module.exports = class CreateOrderController extends transactionEndpointController {

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
			'rebill/read',
			'rebill/create',
			'rebill/update',
			'product/read',
			'affiliate/read',
			'notification/create',
			'tracker/read'
		];

		this.parameter_definitions = {
			execute: {
				required: {
					event: 'event'
				}
			}
		};

		this.parameter_validation = {
			'event': global.SixCRM.routes.path('model', 'endpoints/createOrder/event.json'),
			'session': global.SixCRM.routes.path('model', 'entities/session.json'),
			'creditcard': global.SixCRM.routes.path('model', 'entities/creditcard.json'),
			'rawcreditcard': global.SixCRM.routes.path('model', 'general/rawcreditcard.json'),
			'campaign': global.SixCRM.routes.path('model', 'entities/campaign.json'),
			'customer': global.SixCRM.routes.path('model', 'endpoints/components/customerprocessable.json'),
			'productschedules': global.SixCRM.routes.path('model', 'endpoints/components/productschedules.json'),
			'products': global.SixCRM.routes.path('model', 'endpoints/components/products.json'),
			'rebill': global.SixCRM.routes.path('model', 'entities/rebill.json'),
			'previous_rebill': global.SixCRM.routes.path('model', 'entities/rebill.json'),
			'transaction': global.SixCRM.routes.path('model', 'entities/transaction.json'),
			'info': global.SixCRM.routes.path('model', 'endpoints/createOrder/info.json'),
			'result': global.SixCRM.routes.path('model', 'functional/register/transactionresult.json'),
			'processorresponse': global.SixCRM.routes.path('model', 'functional/register/processorresponse.json'),
			'amount': global.SixCRM.routes.path('model', 'definitions/currency.json'),
			'transactionsubtype': global.SixCRM.routes.path('model', 'definitions/transactionsubtype.json')
		};

		this.sessionController = new SessionController();
		this.sessionHelperController = new SessionHelperController();
		this.customerController = new CustomerController();
		this.customerController.sanitize(false);
		this.creditCardHelperController = new CreditCardHelperController();
		this.creditCardController = new CreditCardController();
		this.campaignController = new CampaignController();
		this.rebillController = new RebillController();
		this.rebillHelperController = new RebillHelperController();
		this.rebillCreatorHelperController = new RebillCreatorHelperController();
		this.registerController = new RegisterController();
		this.transactionHelperController = new TransactionHelperController();
		this.merchantProviderSummaryHelperController = new MerchantProviderSummaryHelperController();
		this.orderHelperController = new OrderHelperController();

		this.initialize();

	}

	execute(event) {

		du.debug('Execute');

		return this.preamble(event).then(() => this.createOrder(this.parameters.get('event')));

	}

	async createOrder(event) {

		du.debug('Create Order');

		let session = await this.hydrateSession(event);
		let customer = await this.getCustomer(event, session);

		let productschedules = event.product_schedules;
		let products = event.products;
		let transactionsubtype = event.transaction_subtype || 'main';
		let rawcreditcard = event.creditcard ? this.creditCardHelperController.formatRawCreditCard(event.creditcard) : undefined;

		let [creditcard, campaign, previous_rebill] = await Promise.all([
			this.getCreditCard(event, customer),
			this.getCampaign(session),
			this.getPreviousRebill(event)
		]);

		this.customerController.sanitize(false);
		[customer, creditcard] = await this.customerController.addCreditCard(customer.id, creditcard);

		this.validateSession(session);

		let rebill = await this.createRebill(session, productschedules, products);
		let processed_rebill = await this.processRebill(rebill, rawcreditcard, transactionsubtype);

		// We'll leave this one in for now to not break too many tests.
		this.parameters.set('info', {
			amount: processed_rebill.amount,
			transactions: processed_rebill.transactions,
			customer,
			rebill,
			session,
			campaign,
			creditcard: processed_rebill.creditcard,
			result: processed_rebill.result,
			product_schedules: productschedules,
			products
		});

		await Promise.all([
			this.reversePreviousRebill(rebill, previous_rebill),
			this.incrementMerchantProviderSummary(processed_rebill.transactions),
			this.updateSessionWithWatermark(session, productschedules, products),
			this.addRebillToStateMachine(processed_rebill.result, rebill),
			AnalyticsEvent.push('order', {
				session,
				campaign
			})
		]);

		return {
			result: processed_rebill.result,
			order: await this.orderHelperController.createOrder({
				rebill,
				transactions: processed_rebill.transactions,
				session,
				customer
			})
		};

	}

	hydrateSession(event) {

		du.debug('Hydrate Session');

		return this.sessionController.get({ id: event.session });

	}

	async getCustomer(event, session) {

		du.debug('Get Customer');

		let customer = await this.customerController.get({ id: session.customer });

		if (_.has(event, 'customer')) {
			Object.assign(customer, event.customer);
			return this.customerController.update({ entity: customer });
		}
		else {
			return customer;
		}

	}

	async getCreditCard(event, customer) {

		du.debug('Set Credit Card');

		let creditcard;
		if (_.has(event, 'creditcard')) {

			this.creditCardController.sanitize(false);
			creditcard = await this.creditCardController.assureCreditCard(event.creditcard, {hydrate_token: true});

			await this.addCreditCardToCustomer(creditcard, customer);

		}

		return creditcard;

	}

	addCreditCardToCustomer(creditcard, customer) {

		du.debug('Add Credit Card to Customer');

		this.customerController.sanitize(false);
		return this.customerController.addCreditCard(customer.id, creditcard);

	}

	getCampaign(session) {

		du.debug('Set Campaign');

		return this.campaignController.get({ id: session.campaign });

	}

	getPreviousRebill(event) {

		if (!_.has(event, 'reverse_on_complete')) {
			return Promise.resolve();
		}

		return this.rebillController.getByAlias({ alias: event.reverse_on_complete });
	}

	validateSession(session) {

		du.debug('Validate Session');

		this.isCurrentSession(session);
		this.isCompleteSession(session);

	}

	isCurrentSession(session) {

		du.debug('Is Current Session');

		if (!this.sessionHelperController.isCurrent({ session: session })) {
			if (!_.includes(['*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c'], global.account)) {
				throw eu.getError('bad_request', 'Session has expired.');
			}
		}

	}

	isCompleteSession(session) {

		du.debug('Is Complete Session');

		if (this.sessionHelperController.isComplete({ session: session })) {
			throw eu.getError('bad_request', 'The session is already complete.');
		}

	}

	createRebill(session, productschedules, products) {

		du.debug('Create Rebill');

		if (_.isNull(productschedules) && _.isNull(products)) {
			throw eu.getError('server', 'Nothing to add to the rebill.');
		}

		return this.rebillCreatorHelperController.createRebill({
			session,
			productschedules,
			products,
			day: -1
		});

	}

	async processRebill(rebill, rawcreditcard, transactionsubtype) {

		du.debug('Process Rebill');

		let argumentation = {
			rebill,
			transactionsubtype,
			creditcard: rawcreditcard
		};

		let register_response = await this.registerController.processTransaction(argumentation);

		let amount = this.transactionHelperController.getTransactionsAmount(register_response.parameters.get('transactions'));

		return {
			register_response,
			creditcard: register_response.getCreditCard(),
			transactions: register_response.parameters.get('transactions'),
			result: register_response.parameters.get('response_type'),
			amount
		};

	}

	async reversePreviousRebill(rebill, previous_rebill) {

		if (_.isNull(previous_rebill)) {
			return Promise.resolve();
		}

		await this.rebillHelperController.updateRebillUpsell({
			rebill: previous_rebill,
			upsell: rebill
		});

		const results = await this.rebillController.listTransactions(previous_rebill);
		const transactions = await this.rebillController.getResult(results, 'transactions');

		await Promise.all(arrayutilities.map(transactions, transaction =>
			this.registerController.reverseTransaction({transaction})));

	}

	incrementMerchantProviderSummary(transactions) {

		du.debug('Increment Merchant Provider Summary');

		if (_.isNull(transactions) || !arrayutilities.nonEmpty(transactions)) {
			return false;
		}

		return arrayutilities.serial(transactions, (current, transaction) => {

			if (transaction.type != 'sale' || transaction.result != 'success') {
				return false;
			}

			return this.merchantProviderSummaryHelperController.incrementMerchantProviderSummary({
				merchant_provider: transaction.merchant_provider,
				day: transaction.created_at,
				total: transaction.amount,
				type: 'new'
			});

		}, null);

	}

	updateSessionWithWatermark(session, product_schedules, products) {

		du.debug('Update Session With Watermark');

		if (!_.has(session, 'watermark')) {
			session.watermark = {
				products: [],
				product_schedules: []
			}
		}

		if (arrayutilities.nonEmpty(product_schedules)) {

			if (!_.has(session.watermark, 'product_schedules')) {
				session.watermark.product_schedules = [];
			}

			arrayutilities.map(product_schedules, product_schedule_group => {
				session.watermark.product_schedules.push(product_schedule_group);
			});
		}

		if (arrayutilities.nonEmpty(products)) {

			if (!_.has(session.watermark, 'products')) {
				session.watermark.products = [];
			}

			arrayutilities.map(products, product_group => {
				session.watermark.products.push(product_group);
			});

		}

		return this.sessionController.update({ entity: session });

	}

	addRebillToStateMachine(result, rebill) {

		du.debug('Add Rebill To State Machine');

		if (result == 'success') {

			return this.updateRebillState()
				.then(() => this.addRebillToQueue(rebill))

		} else {

			rebill.no_process = true;

			return this.rebillController.update({ entity: rebill });

		}

	}

	updateRebillState(rebill) {

		du.debug('Update Rebill State');

		return this.rebillHelperController.updateRebillState({
			rebill,
			new_state: 'hold'
		});

	}

	addRebillToQueue(rebill) {

		du.debug('Add Rebill To Queue');

		return this.rebillHelperController.addRebillToQueue({
			rebill,
			queue_name: 'hold'
		});

	}

}
