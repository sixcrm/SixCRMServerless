const _ = require('lodash');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;

const AccountController = require('../entities/Account');
const AccountHelperController = require('../helpers/entities/account/Account');
const AnalyticsEvent = require('../helpers/analytics/analytics-event');
const CreditCardController = require('../entities/CreditCard');
const CustomerController = require('../entities/Customer');
const EventPushHelperController = require('../helpers/events/EventPush');
const OrderHelperController = require('../helpers/order/Order');
const RebillCreatorHelperController = require('../helpers/entities/rebill/RebillCreator');
const RegisterController = require('../providers/register/Register');
const SessionController = require('../entities/Session');
const transactionEndpointController = require('../endpoints/components/transaction');

const accountController = new AccountController();
const accountHelperController = new AccountHelperController();
const customerController = new CustomerController();
const creditCardController = new CreditCardController();
const eventPushHelperController = new EventPushHelperController();
const orderHelperController = new OrderHelperController();
const rebillCreatorHelperController = new RebillCreatorHelperController();
const registerController = new RegisterController();
const sessionController = new SessionController();

customerController.sanitize(false);
creditCardController.sanitize(false);

module.exports = class RestoreAccountController extends transactionEndpointController {

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
			'event': global.SixCRM.routes.path('model', 'endpoints/restoreAccount/event.json')
		};

		this.initialize();
	}

	async execute(event) {
		await this.preamble(event)
		const {creditcard: raw_creditcard} = this.parameters.get('event');

		const account = await accountController.get({id: global.account});
		const account_deactivated = _.has(account, 'billing.deactivated_at');

		if (!account_deactivated) {
			throw eu.getError('bad_request', 'Account is not deactivated.');
		}

		const session = await this.getBillingSession(account);
		let creditcard;
		if (raw_creditcard) {
			creditcard = await this.persistCreditCard(raw_creditcard, session.customer);
		}
		const products = this.getSubscriptionProducts(session);
		const rebill = await rebillCreatorHelperController.createRebill({session});
		const register_response = await this.executeBilling({rebill, creditcard, products});
		const result = register_response.parameters.get('response_type');
		if (result === 'success') {
			await accountHelperController.restoreAccount();
		}
		const transactions = register_response.parameters.get('transactions');
		await this.incrementMerchantProviderSummary(transactions);
		await this.publishEvents({register_response, session, rebill});

		const order = await orderHelperController.createOrder({
			rebill,
			transactions,
			session
		});

		return {
			result,
			order
		};
	}

	async getBillingSession(account) {
		if (!_.has(account, 'billing.session')) {
			throw eu.getError('not_found', 'Could not find billing session details.');
		}
		const session = await sessionController.get({id: account.billing.session});
		if (session === null) {
			throw eu.getError('not_found', 'Could not find billing session details.');
		}
		return session;
	}

	async persistCreditCard(creditcard_attrs, customer) {
		const creditcard = await creditCardController.assureCreditCard(creditcard_attrs, {hydrate_token: true});
		await customerController.addCreditCard(customer, creditcard);
		return creditcard;
	}

	async getSubscriptionProducts(session) {
		const products = _.get(session, 'watermark.product_schedules[0].product_schedule.schedule');
		if (products === undefined) {
			throw eu.getError('server', 'An unexpected error occurred when attempting to find subscription product.');
		}
		return products;
	}

	async executeBilling({rebill, creditcard, products}) {
		try {
			return registerController.processTransaction({rebill, creditcard, products});
		} catch(error) {
			throw eu.getError('server', 'Register Controller returned a error.');
		}
	}

	async getLastRebillForSession(session) {
		const rebills = await sessionController.listRebills(session);
		if (rebills === null) {
			throw eu.getError('not_found', 'Could not find rebills for billing session.')
		}
		return _.last(_.sortBy(rebills, 'bill_at'));
	}

	async incrementMerchantProviderSummary(transactions) {
		du.debug('Increment Merchant Provider Summary');

		if (_.isNull(transactions) || !arrayutilities.nonEmpty(transactions)) {
			return;
		}

		return Promise.all(transactions.map(transaction => {
			if (transaction.type != 'sale' || transaction.result != 'success') {
				return;
			}

			return this.merchantProviderSummaryHelperController.incrementMerchantProviderSummary({
				merchant_provider: transaction.merchant_provider,
				day: transaction.created_at,
				total: transaction.amount,
				type: 'new'
			});
		}));
	}

	async publishEvents({register_response, session, rebill}) {
		const campaign = await sessionController.getCampaign(session);
		const customer = await sessionController.getCustomer(session);
		const response_type = register_response.parameters.get('response_type');
		const creditcard = register_response.getCreditCard();

		AnalyticsEvent.push('order', {session, campaign});
		AnalyticsEvent.push('create_order_initial', {rebill});
		eventPushHelperController().pushEvent({
			event_type: response_type === 'success' ? 'allorders' : 'decline',
			context: {
				campaign,
				session,
				customer,
				creditcard,
				rebill
			}
		});
	}
}
