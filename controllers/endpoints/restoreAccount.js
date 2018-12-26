const _ = require('lodash');
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
const permissionutilities = require('@6crm/sixcrmcore/util/permission-utilities').default;
const timestamp = require('@6crm/sixcrmcore/util/timestamp').default;

const AccountController = require('../entities/Account');
const AccountHelperController = require('../helpers/entities/account/Account');
const AnalyticsEvent = require('../helpers/analytics/analytics-event');
const CreditCardController = require('../entities/CreditCard');
const CustomerController = require('../entities/Customer');
const EventPushHelperController = require('../helpers/events/EventPush');
const MerchantProviderSummaryHelperController = require('../helpers/entities/merchantprovidersummary/MerchantProviderSummary');
const OrderHelperController = require('../helpers/order/Order');
const RebillCreatorHelperController = require('../helpers/entities/rebill/RebillCreator');
const RegisterController = require('../providers/register/Register');
const SessionController = require('../entities/Session');
const UserController = require('../entities/User');
const transactionEndpointController = require('../endpoints/components/transaction');

const accountController = new AccountController();
const accountHelperController = new AccountHelperController();
const customerController = new CustomerController();
const creditCardController = new CreditCardController();
const eventPushHelperController = new EventPushHelperController();
const merchantProviderSummaryHelperController = new MerchantProviderSummaryHelperController();
const orderHelperController = new OrderHelperController();
const rebillCreatorHelperController = new RebillCreatorHelperController();
const registerController = new RegisterController();
const sessionController = new SessionController();
const userController = new UserController();

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

	async validateAccount(event) {
		await accountHelperController.validateAccount();
		return event;
	}

	async execute(event) {
		await this.preamble(event)
		const {creditcard: raw_creditcard, account: account_id} = this.parameters.get('event');
		await this.useAccountingContext();

		accountController.disableACLs();
		const account = await accountController.get({id: account_id});
		accountController.enableACLs();
		const account_deactivated = _.has(account, 'billing.deactivated_at') && account.billing.deactivated_at <= timestamp.getISO8601();
		if (!account_deactivated) {
			throw eu.getError('bad_request', 'Account is not deactivated.');
		}

		const session = await this.createBillingSession(account);
		if (raw_creditcard) {
			await this.persistCreditCard(raw_creditcard, session.customer);
		}
		const products = await this.getSubscriptionProducts(session);
		const rebill = await rebillCreatorHelperController.createRebill({session, day: -1, products});
		const register_response = await this.executeBilling(rebill, raw_creditcard);
		const result = register_response.parameters.get('response_type');
		if (result === 'success') {
			await accountHelperController.restoreAccount(account, session);
		}
		const transactions = register_response.parameters.get('transactions');
		await this.triggerSessionCloseStateMachine(session);
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

	async useAccountingContext() {
		permissionutilities.setGlobalAccount('3f4abaf6-52ac-40c6-b155-d04caeb0391f');
		const user = await userController.getUserStrict('accounting@sixcrm.com');
		userController.setGlobalUser(user);
	}

	async createBillingSession(account) {
		if (!_.has(account, 'billing.session')) {
			throw eu.getError('not_found', 'Could not find billing session details.');
		}
		const previous_session = await sessionController.get({id: account.billing.session});
		if (previous_session === null) {
			throw eu.getError('not_found', 'Could not find billing session details.');
		}
		const session = Object.assign(_.pick(previous_session, [
			'account',
			'customer',
			'campaign',
			'watermark',
			'product_schedules',
			'affiliate',
			'subaffiliate_1',
			'subaffiliate_2',
			'subaffiliate_3',
			'subaffiliate_4',
			'subaffiliate_5',
			'cid'
		]), {
			completed: false
		});
		await sessionController.create({entity: session});
		await this.triggerSessionCloseStateMachine(session);
		return session;
	}

	async persistCreditCard(creditcard_attrs, customer) {
		const creditcard = await creditCardController.assureCreditCard(Object.assign({}, creditcard_attrs), {hydrate_token: true});
		await customerController.addCreditCard(customer, creditcard);
		return creditcard;
	}

	async getSubscriptionProducts(session) {
		const product = _.get(session, 'watermark.product_schedules[0].product_schedule.schedule[0].product');
		if (product === undefined) {
			throw eu.getError('server', 'An unexpected error occurred when attempting to find subscription product.');
		}
		return [{
			product: product.id,
			quantity: 1
		}];
	}

	async executeBilling(rebill, creditcard) {
		try {
			const parameters = {rebill};
			if (creditcard) {
				parameters.creditcard = creditcard;
			}
			return registerController.processTransaction(parameters);
		} catch(error) {
			throw eu.getError('server', 'Register Controller returned a error.');
		}
	}

	async incrementMerchantProviderSummary(transactions) {
		if (_.isNull(transactions) || !arrayutilities.nonEmpty(transactions)) {
			return;
		}

		return Promise.all(transactions.map(transaction => {
			if (transaction.type != 'sale' || transaction.result != 'success') {
				return;
			}

			return merchantProviderSummaryHelperController.incrementMerchantProviderSummary({
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
		AnalyticsEvent.push('create_order', {
			rebill,
			type: 'initial'
		});
		eventPushHelperController.pushEvent({
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
