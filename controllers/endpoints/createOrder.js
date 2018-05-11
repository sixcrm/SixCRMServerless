const _ = require('lodash');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const transactionEndpointController = global.SixCRM.routes.include('controllers', 'endpoints/components/transaction.js');
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

		this.initialize();

	}

	execute(event) {

		du.debug('Execute');

		this.parameters.store = {};

		return this.preamble(event)
			.then(() => this.createOrder());

	}

	createOrder() {

		du.debug('Create Order');

		return this.hydrateSession()
			.then(() => this.setCustomer())
			.then(() => this.hydrateEventAssociatedParameters())
			.then(() => this.validateEventProperties())
			.then(() => this.createRebill())
			.then(() => this.processRebill())
			.then(() => this.buildInfoObject())
			.then(() => this.postProcessing())
			.then(() => this.respond());

	}

	hydrateSession() {

		du.debug('Set Session');

		let event = this.parameters.get('event');

		if (!_.has(this.sessionController)) {
			const SessionController = global.SixCRM.routes.include('entities', 'Session.js');
			this.sessionController = new SessionController();
		}

		return this.sessionController.get({
			id: event.session
		}).then(session => {
			this.parameters.set('session', session);
			return true;
		});

	}

	hydrateEventAssociatedParameters() {

		du.debug('Hydrate Event Associated Parameters');

		let promises = [
			this.setProductSchedules(),
			this.setProducts(),
			this.setTransactionSubType(),
			this.setRawCreditCard(),
			this.setCreditCard(),
			this.setCampaign(),
			this.setPreviousRebill()
		];

		return Promise.all(promises).then(() => {
			return true;
		});

	}

	setProductSchedules() {

		du.debug('Set Product Schedules');

		let event = this.parameters.get('event');

		if (_.has(event, 'product_schedules')) {
			this.parameters.set('productschedules', event.product_schedules);
		}

		return Promise.resolve(true);

	}

	setProducts() {

		du.debug('Set Products');

		let event = this.parameters.get('event');

		if (_.has(event, 'products')) {
			this.parameters.set('products', event.products);
		}

		return Promise.resolve(true);

	}

	setTransactionSubType() {

		du.debug('Set Transaction Subtype');

		let event = this.parameters.get('event');

		if (_.has(event, 'transaction_subtype')) {
			this.parameters.set('transactionsubtype', event.transaction_subtype);
		} else {
			this.parameters.set('transactionsubtype', 'main');
		}

		return Promise.resolve(true);

	}

	setCampaign() {

		du.debug('Set Campaign');

		let session = this.parameters.get('session');

		if (!_.has(this, 'campaignController')) {
			const CampaignController = global.SixCRM.routes.include('entities', 'Campaign.js');
			this.campaignController = new CampaignController();
		}

		return this.campaignController.get({
			id: session.campaign
		}).then(campaign => {
			this.parameters.set('campaign', campaign);
			return true;
		});

	}

	setRawCreditCard() {

		du.debug('Set Raw Credit Card');

		let event = this.parameters.get('event');

		if (_.has(event, 'creditcard')) {

			if (!_.has(this, 'creditCardHelperController')) {
				const CreditCardHelperController = global.SixCRM.routes.include('helpers', 'entities/creditcard/CreditCard.js');
				this.creditCardHelperController = new CreditCardHelperController();
			}

			let cloned_card = objectutilities.clone(event.creditcard);
			let raw_creditcard = this.creditCardHelperController.formatRawCreditCard(cloned_card);

			this.parameters.set('rawcreditcard', raw_creditcard);

		}

		return

	}

	setCreditCard() {

		du.debug('Set Credit Card');

		let event = this.parameters.get('event');

		if (_.has(event, 'creditcard')) {

			if (!_.has(this, 'creditCardController')) {
				const CreditCardController = global.SixCRM.routes.include('entities', 'CreditCard.js');
				this.creditCardController = new CreditCardController();
			}

			this.creditCardController.sanitize(false);
			return this.creditCardController.assureCreditCard(event.creditcard, {hydrate_token: true})
				.then(creditcard => {
					this.parameters.set('creditcard', creditcard);
					return true;
				})
				.then(() => this.addCreditCardToCustomer());

		}

		return Promise.resolve(true);

	}

	addCreditCardToCustomer() {

		du.debug('Add Credit Card to Customer');

		let creditcard = this.parameters.get('creditcard');
		let customer = this.parameters.get('customer');

		if (!_.has(this, 'customerController')) {
			const CustomerController = global.SixCRM.routes.include('entities', 'Customer.js');
			this.customerController = new CustomerController();

		}

		this.customerController.sanitize(false);
		return this.customerController.addCreditCard(customer.id, creditcard).then(([customer, creditcard]) => {
			this.parameters.set('creditcard', creditcard);
			this.parameters.set('customer', customer);
			return true;
		});

	}

	setCustomer() {

		du.debug('Set Customer');

		let session = this.parameters.get('session');
		let event = this.parameters.get('event');

		if (!_.has(this, 'customerController')) {
			const CustomerController = global.SixCRM.routes.include('entities', 'Customer.js');
			this.customerController = new CustomerController();
			this.customerController.sanitize(false);
		}

		return this.customerController.get({
			id: session.customer
		}).then(customer => {
			if (_.has(event, 'customer')) {
				Object.assign(customer, event.customer);
				return this.customerController.update({
					entity: customer
				});
			}
			return customer;
		})
			.then(customer => {
				this.parameters.set('customer', customer);
				return true;
			});
	}

	setPreviousRebill() {

		const event = this.parameters.get('event');

		if (!_.has(event, 'reverse_on_complete')) {
			return Promise.resolve();
		}

		if (!_.has(this, 'rebillController')) {
			const RebillController = global.SixCRM.routes.include('controllers', 'entities/Rebill.js');
			this.rebillController = new RebillController();
		}

		return this.rebillController.getByAlias({
			alias: event.reverse_on_complete
		}).then(rebill => {
			this.parameters.set('previous_rebill', rebill);
			return true;
		});
	}

	validateEventProperties() {

		du.debug('Validate Event Properties');

		this.isCurrentSession();
		this.isCompleteSession();

		return Promise.resolve(true);

	}

	isCompleteSession() {

		du.debug('Is Complete Session');

		let session = this.parameters.get('session');

		if (!_.has(this, 'sessionHelperController')) {
			const SessionHelperController = global.SixCRM.routes.include('helpers', 'entities/session/Session.js');

			this.sessionHelperController = new SessionHelperController();
		}

		if (this.sessionHelperController.isComplete({
			session: session
		})) {
			throw eu.getError('bad_request', 'The session is already complete.');
		}

		return true;

	}

	isCurrentSession() {

		du.debug('Is Current Session');

		let session = this.parameters.get('session');

		if (!_.has(this, 'sessionHelperController')) {
			const SessionHelperController = global.SixCRM.routes.include('helpers', 'entities/session/Session.js');

			this.sessionHelperController = new SessionHelperController();
		}

		if (!this.sessionHelperController.isCurrent({
			session: session
		})) {
			if (!_.includes(['*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c'], global.account)) {
				throw eu.getError('bad_request', 'Session has expired.');
			}
		}

		return true;

	}

	createRebill() {

		du.debug('Create Rebill');

		let session = this.parameters.get('session');
		let product_schedules = this.parameters.get('productschedules', {fatal: false});
		let products = this.parameters.get('products', {fatal: false});

		let argumentation = {
			session: session,
			day: -1
		};

		if (!_.isNull(product_schedules)) {
			argumentation.product_schedules = product_schedules;
		}

		if (!_.isNull(products)) {
			argumentation.products = products;
		}

		if (_.isNull(product_schedules) && _.isNull(products)) {
			throw eu.getError('server', 'Nothing to add to the rebill.');
		}

		if (!_.has(this, 'rebillCreatorHelperController')) {
			const RebillCreatorHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/RebillCreator.js');

			this.rebillCreatorHelperController = new RebillCreatorHelperController();
		}

		return this.rebillCreatorHelperController.createRebill(argumentation)
			.then(rebill => {
				this.parameters.set('rebill', rebill);
				return true;
			});

	}

	processRebill() {

		du.debug('Process Rebill');

		let rebill = this.parameters.get('rebill');

		if (!_.has(this, 'registerController')) {
			const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
			this.registerController = new RegisterController();
		}

		let raw_creditcard = this.parameters.get('rawcreditcard', {fatal: false});

		let argumentation = {
			rebill: rebill,
			transactionsubtype: this.parameters.get('transactionsubtype', {fatal: false})
		};

		if (!_.isNull(raw_creditcard)) {
			argumentation.creditcard = raw_creditcard;
		}

		return this.registerController.processTransaction(argumentation)
			.then((register_response) => {

				if (!_.has(this, 'transactionHelperController')) {
					const TransactionHelperController = global.SixCRM.routes.include('helpers', 'entities/transaction/Transaction.js');

					this.transactionHelperController = new TransactionHelperController();
				}

				this.parameters.set('registerresponse', register_response);

				let amount = this.transactionHelperController.getTransactionsAmount(register_response.parameters.get('transactions'));

				this.parameters.set('creditcard', register_response.getCreditCard());
				this.parameters.set('transactions', register_response.parameters.get('transactions'));
				this.parameters.set('result', register_response.parameters.get('response_type'));
				this.parameters.set('amount', amount);

				return true;

			});

	}

	buildInfoObject() {

		du.debug('Build Info Object');

		let info = {
			amount: this.parameters.get('amount'),
			transactions: this.parameters.get('transactions'),
			customer: this.parameters.get('customer'),
			rebill: this.parameters.get('rebill'),
			session: this.parameters.get('session'),
			campaign: this.parameters.get('campaign'),
			creditcard: this.parameters.get('creditcard'),
			result: this.parameters.get('result')
		};

		let product_schedules = this.parameters.get('productschedules', {fatal: false});

		if (!_.isNull(product_schedules)) {
			info.product_schedules = product_schedules;
		}

		let products = this.parameters.get('products', {fatal: false});

		if (!_.isNull(products)) {
			info.products = products;
		}

		this.parameters.set('info', info);

		return Promise.resolve(true);

	}

	postProcessing() {

		du.debug('Post Processing');

		return Promise.all([
			this.reversePreviousRebill(),
			AnalyticsEvent.push('order', {
				session: this.parameters.get('session', {fatal: false}),
				campaign: this.parameters.get('campaign', {fatal: false})
			}),
			this.incrementMerchantProviderSummary(),
			this.updateSessionWithWatermark(),
			this.addRebillToStateMachine()
		]);

	}

	reversePreviousRebill() {
		const rebill = this.parameters.get('rebill');
		const previous_rebill = this.parameters.get('previous_rebill', {fatal: false});

		if (_.isNull(previous_rebill)) {
			return Promise.resolve();
		}

		if (!_.has(this, 'rebillController')) {
			const RebillController = global.SixCRM.routes.include('controllers', 'entities/Rebill.js');
			this.rebillController = new RebillController();
		}

		if (!_.has(this, 'rebillHelperController')) {
			const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
			this.rebillHelperController = new RebillHelperController();
		}

		if (!_.has(this, 'registerController')) {
			const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
			this.registerController = new RegisterController();
		}

		return this.rebillHelperController.updateRebillUpsell({
			rebill: previous_rebill,
			upsell: rebill
		})
			.then(() => this.rebillController.listTransactions(previous_rebill))
			.then(results => this.rebillController.getResult(results, 'transactions'))
			.then(transactions => Promise.all(
				arrayutilities.map(transactions, transaction =>
					this.registerController.reverseTransaction({transaction}))
			));
	}

	incrementMerchantProviderSummary() {

		du.debug('Increment Merchant Provider Summary');

		let transactions = this.parameters.get('transactions');

		if (_.isNull(transactions) || !arrayutilities.nonEmpty(transactions)) {
			return false;
		}

		const MerchantProviderSummaryHelperController = global.SixCRM.routes.include('helpers', 'entities/merchantprovidersummary/MerchantProviderSummary.js');

		return arrayutilities.serial(transactions, (current, transaction) => {

			if (transaction.type != 'sale' || transaction.result != 'success') {
				return false;
			}

			let merchantProviderSummaryHelperController = new MerchantProviderSummaryHelperController();

			return merchantProviderSummaryHelperController.incrementMerchantProviderSummary({
				merchant_provider: transaction.merchant_provider,
				day: transaction.created_at,
				total: transaction.amount,
				type: 'new'
			});

		}, null);

	}

	updateSessionWithWatermark() {

		du.debug('Update Session With Watermark');

		let session = this.parameters.get('session');

		if (!_.has(session, 'watermark')) {
			session.watermark = {
				products: [],
				product_schedules: []
			}
		}

		let product_schedules = this.parameters.get('productschedules', {fatal: false});
		let products = this.parameters.get('products', {fatal: false});

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

		if (!_.has(this, 'sessionController')) {
			const SessionController = global.SixCRM.routes.include('entities', 'Session.js');
			this.sessionController = new SessionController();
		}

		return this.sessionController.update({
			entity: session
		}).then(result => {
			this.parameters.set('session', result);
			return true;
		});

	}

	addRebillToStateMachine() {

		du.debug('Add Rebill To State Machine');

		if (this.parameters.get('result') == 'success') {

			return this.updateRebillState()
				.then(() => this.addRebillToQueue())

		} else {

			let rebill = this.parameters.get('rebill');

			rebill.no_process = true;

			if (!_.has(this, 'rebillController')) {
				const RebillController = global.SixCRM.routes.include('controllers', 'entities/Rebill.js');
				this.rebillController = new RebillController();
			}

			return this.rebillController.update({
				entity: rebill
			}).then(() => {
				return true;
			});

		}

	}

	addRebillToQueue() {

		du.debug('Add Rebill To Queue');

		let rebill = this.parameters.get('rebill');

		if (!_.has(this, 'rebillHelperController')) {
			const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');

			this.rebillHelperController = new RebillHelperController();
		}

		return this.rebillHelperController.addRebillToQueue({
			rebill: rebill,
			queue_name: 'hold'
		}).then(() => {
			return true;
		});

	}

	updateRebillState() {

		du.debug('Update Rebill State');

		let rebill = this.parameters.get('rebill');

		if (!_.has(this, 'rebillHelperController')) {
			const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');

			this.rebillHelperController = new RebillHelperController();
		}

		return this.rebillHelperController.updateRebillState({
			rebill: rebill,
			new_state: 'hold'
		}).then(() => {
			return true;
		});

	}

	async buildOrderObject(){

		du.debug('Build Order Object');

		const OrderHelperController = global.SixCRM.routes.include('helpers', 'order/Order.js');
		let orderHelperController = new OrderHelperController();

		let session = this.parameters.get('session');
		let transactions = this.parameters.get('transactions');
		let customer = this.parameters.get('customer');
		let rebill = this.parameters.get('rebill');

		let order = await orderHelperController.createOrder({rebill: rebill, transactions: transactions, session: session, customer: customer});

		return order;

	}

	async respond(){

		du.debug('Respond');

		let result = this.parameters.get('result');
		let order = await this.buildOrderObject();

		return {
			result: result,
			order: order
		};

	}

}
