const _ = require('lodash');
const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/lib/util/array-utilities').default;
const permissionutilities = require('@6crm/sixcrmcore/lib/util/permission-utilities').default;

const AccountController = require('../entities/Account');
const AccountHelperController = require('../helpers/entities/account/Account');
const CreditCardController = require('../entities/CreditCard');
const CustomerController = require('../entities/Customer');
const EventPushHelperController = require('../helpers/events/EventPush');
const MerchantProviderSummaryHelperController = require('../helpers/entities/merchantprovidersummary/MerchantProviderSummary');
const OrderHelperController = require('../helpers/order/Order');
const RebillController = require('../entities/Rebill');
const RegisterController = require('../providers/register/Register');
const SessionController = require('../entities/Session');
const UserController = require('../entities/User');
const transactionEndpointController = require('../endpoints/components/transaction');

const accountController = new AccountController();
const accountHelperController = new AccountHelperController();
const creditCardController = new CreditCardController();
const customerController = new CustomerController();
const eventPushHelperController = new EventPushHelperController();
const merchantProviderSummaryHelperController = new MerchantProviderSummaryHelperController();
const orderHelperController = new OrderHelperController();
const rebillController = new RebillController();
const registerController = new RegisterController();
const sessionController = new SessionController();
const userController = new UserController();

customerController.sanitize(false);
creditCardController.sanitize(false);

module.exports = class ReattemptRebillController extends transactionEndpointController {

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
			'event': global.SixCRM.routes.path('model', 'endpoints/reattemptRebill/event.json')
		};

		this.initialize();
	}

	async validateAccount(event) {
		await accountHelperController.validateAccount();
		return event;
	}

	async execute(event, context) {
		await this.preamble(event, context);
		const {rebill: rebill_id, creditcard: raw_creditcard} = this.parameters.get('event');

		const account = await accountController.get({id: global.account});
		await this.useAccountingContext();
		const rebill = await rebillController.get({id: rebill_id});
		const session = await sessionController.get({id: rebill.parentsession});
		if (raw_creditcard) {
			await this.persistCreditCard(raw_creditcard, session.customer);
		}
		const register_response = await this.executeBilling(rebill, raw_creditcard);
		const transactions = register_response.parameters.get('transactions');
		await this.checkAccountStanding({account, session});
		await this.incrementMerchantProviderSummary(transactions);
		await this.publishEvents({register_response, session, rebill});

		const order = await orderHelperController.createOrder({
			rebill,
			transactions,
			session
		});

		return {
			result: register_response.parameters.get('response_type'),
			order
		};
	}

	async useAccountingContext() {
		permissionutilities.setGlobalAccount('3f4abaf6-52ac-40c6-b155-d04caeb0391f');
		const user = await userController.getUserStrict('accounting@sixcrm.com');
		userController.setGlobalUser(user);
	}

	async persistCreditCard(creditcard_attrs, customer) {
		const creditcard = await creditCardController.assureCreditCard(Object.assign({}, creditcard_attrs), {hydrate_token: true});
		await customerController.addCreditCard(customer, creditcard);
		return creditcard;
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

	async checkAccountStanding({account, session}) {
		const billing_session_id = _.get(account, 'billing.session');
		if (!billing_session_id || billing_session_id !== session.id) {
			return;
		}

		const account_limited = _.has(account, 'billing.limited_at');
		const account_deactivated = _.has(account, 'billing.deactivated_at');
		if (!account_limited || account_deactivated) {
			return;
		}

		await accountHelperController.cancelDeactivation({account});
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

		await eventPushHelperController.pushEvent({
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
