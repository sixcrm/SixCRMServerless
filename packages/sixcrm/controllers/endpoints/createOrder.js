const _ = require('lodash');
const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/lib/util/array-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/lib/util/object-utilities').default;
const timestamp = require('@6crm/sixcrmcore/lib/util/timestamp').default;
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
const AnalyticsEvent = global.SixCRM.routes.include('helpers', 'analytics/analytics-event.js');
const ProductScheduleController = global.SixCRM.routes.include('controllers', 'entities/ProductSchedule.js');

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
		this.productScheduleController = new ProductScheduleController();

		this.initialize();

	}

	async execute(event, context) {
		await this.preamble(event, context);
		await this.validateParameters(this.parameters.get('event'));
		return this.createOrder(this.parameters.get('event'));
	}

	async validateParameters() {

	}

	async createOrder(event) {
		let session = await this.hydrateSession(event);

		if (session.product_schedules && session.product_schedules.length) {
			throw eu.getError('bad_request', 'Session already has a product schedule attached.')
		}

		if (_(session).get('watermark.product_schedules') && session.watermark.product_schedules.length) {
			throw eu.getError('bad_request', 'Session already has a product schedule attached.')
		}

		let customer = await this.getCustomer(event, session);
		let [rawcreditcard, creditcard, campaign, previous_rebill] = await Promise.all([
			this.getRawCreditCard(event),
			this.getCreditCard(event, customer),
			this.getCampaign(session),
			this.getPreviousRebill(event)
		]);

		let transaction_subtype = this.getTransactionSubtype(event);

		if (!_.isUndefined(creditcard)) {
			[customer, creditcard] = await this.customerController.addCreditCard(customer.id, creditcard);
		}

		this.validateSession(session);

		let rebill = await this.createRebill(session, event.product_schedules, event.products);
		let processed_rebill = await this.processRebill(rebill, event, rawcreditcard);

		// We'll leave this one in for now to not break too many tests.
		//Technical Debt:  Eliminate
		this.parameters.set('info', {
			amount: processed_rebill.amount,
			transactions: processed_rebill.transactions,
			customer,
			rebill,
			session,
			campaign,
			creditcard: processed_rebill.creditcard,
			result: processed_rebill.result,
			product_schedules: event.product_schedules,
			products: event.products
		});

		let order = await this.orderHelperController.createOrder({
			rebill,
			transactions: processed_rebill.transactions,
			session,
			customer
		});

		await Promise.all([
			this.updateRebillPaidStatus(rebill, processed_rebill.transactions),
			this.reversePreviousRebill(rebill, previous_rebill),
			this.incrementMerchantProviderSummary(processed_rebill.transactions),
			this.updateSessionWithWatermark(session, event.product_schedules, event.products)
				.then(() => this.markNonSuccessfulSession(processed_rebill.result, session)),
			this.markNonSuccessfulRebill(processed_rebill.result, rebill),
			AnalyticsEvent.push('order', {
				session,
				campaign,
			}),
			AnalyticsEvent.push('create_order', {
				rebill,
				type: 'initial'
			}),
			this.publishEvent({processed_rebill, rebill, campaign, session, order, transaction_subtype, customer, creditcard})
		]);

		return {
			result: processed_rebill.result,
			order: order
		};

	}

	publishEvent({processed_rebill, rebill, campaign, session, order, transaction_subtype, customer, creditcard}) {
		if (processed_rebill.result === 'success') {
			this.pushEvent({
				event_type: 'order', context: {
					rebill: rebill,
					campaign: campaign,
					session: session,
					order: order,
					transactionsubtype: transaction_subtype,
					result: processed_rebill.result,
					customer: customer,
					creditcard: creditcard
				}
			});
		}
	}

	getTransactionSubtype(event){
		let return_value = 'main';

		if(_.has(event, 'transaction_subtype')){
			return_value = event.transaction_subtype;
		}

		return return_value;

	}

	hydrateSession(event) {
		return this.sessionController.get({ id: event.session });

	}

	async getCustomer(event, session) {
		let customer = await this.customerController.get({ id: session.customer });

		if (_.has(event, 'customer')) {
			Object.assign(customer, event.customer);
			return this.customerController.update({ entity: customer });
		}
		else {
			return customer;
		}

	}

	async getRawCreditCard(event) {
		let rawcreditcard;
		if (_.has(event, 'creditcard')) {

			let cloned_card = objectutilities.clone(event.creditcard);
			rawcreditcard = this.creditCardHelperController.formatRawCreditCard(cloned_card);

		}

		return rawcreditcard;

	}

	async getCreditCard(event, customer) {
		let creditcard;
		if (_.has(event, 'creditcard')) {

			this.creditCardController.sanitize(false);
			creditcard = await this.creditCardController.assureCreditCard(event.creditcard, {hydrate_token: true});

			await this.addCreditCardToCustomer(creditcard, customer);

		}

		return creditcard;

	}

	addCreditCardToCustomer(creditcard, customer) {
		this.customerController.sanitize(false);
		return this.customerController.addCreditCard(customer.id, creditcard);

	}

	getCampaign(session) {
		return this.campaignController.get({ id: session.campaign });

	}

	getPreviousRebill(event) {

		if (!_.has(event, 'reverse_on_complete')) {
			return Promise.resolve();
		}

		return this.rebillController.getByAlias({ alias: event.reverse_on_complete });
	}

	validateSession(session) {
		this.isCurrentSession(session);
		this.isCompleteSession(session);

	}

	isCurrentSession(session) {
		if (!this.sessionHelperController.isCurrent({ session: session })) {
			if (!_.includes(['*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c'], global.account)) {
				throw eu.getError('bad_request', 'Session has expired.');
			}
		}

	}

	isCompleteSession(session) {
		if (this.sessionHelperController.isComplete({ session: session })) {
			throw eu.getError('bad_request', 'The session is already complete.');
		}

	}

	createRebill(session, product_schedules, products) {
		if (!product_schedules && !products) {
			throw eu.getError('server', 'Nothing to add to the rebill.');
		}

		let argumentation = {
			session,
			day: -1
		};

		if (product_schedules) {
			argumentation.product_schedules = product_schedules;
		}
		if (products) {
			argumentation.products = products;
		}

		const result = this.rebillCreatorHelperController.createRebill(argumentation);

		if (_.includes(['CONCLUDE', 'CONCLUDED'], result)) {
			throw eu.getError('bad_request', 'Session has been concluded.');
		}

		return result;
	}

	async processRebill(rebill, event, rawcreditcard) {
		let argumentation = {
			rebill,
			transactionsubtype: this.getTransactionSubType(event)
		};

		if (!_.isUndefined(rawcreditcard)) {
			argumentation.creditcard = rawcreditcard;
		}

		let register_response = await this.registerController.processTransaction(argumentation);

		const transactions = register_response.getTransactions();
		if (transactions[0]) {
			rebill.merchant_provider = transactions[0].merchant_provider;
			await this.rebillController.update({entity: rebill});
		}

		let amount = this.transactionHelperController.getTransactionsAmount(register_response.parameters.get('transactions'));

		return {
			creditcard: register_response.getCreditCard(),
			transactions: register_response.parameters.get('transactions'),
			result: register_response.parameters.get('response_type'),
			amount
		};

	}

	async reversePreviousRebill(rebill, previous_rebill) {

		if (!previous_rebill) {
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

	async updateRebillPaidStatus(rebill, transactions) {
		const paid_status = await this.rebillController.getPaidStatus(rebill, transactions);
		if (paid_status === 'none') {
			return;
		}

		rebill.paid = {
			detail: paid_status,
			updated_at: timestamp.getISO8601()
		};

		return this.rebillController.update({entity: rebill});
	}

	incrementMerchantProviderSummary(transactions) {
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

	markNonSuccessfulRebill(result, rebill) {
		if (result !== 'success') {

			rebill.no_process = true;

			return this.rebillController.update({ entity: rebill });

		}

	}

	markNonSuccessfulSession(result, session) {
		if (result !== 'success') {

			session.concluded = true;

			return this.sessionController.update({ entity: session });

		}

	}
}
