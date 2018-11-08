const _ = require('lodash');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;

const AccountController = require('../entities/Account');
const AccountHelperController = require('../helpers/entities/account/Account');
const CreditCardController = require('../entities/CreditCard');
const CustomerController = require('../entities/Customer');
const EventPushHelperController = require('../helpers/events/EventPush');
const OrderHelperController = require('../helpers/order/Order');
const RebillController = require('../entities/Rebill');
const RegisterController = require('../providers/register/Register');
const SessionController = require('../entities/Session');
const transactionEndpointController = require('../endpoints/components/transaction');

const accountController = new AccountController();
const accountHelperController = new AccountHelperController();
const creditCardController = new CreditCardController();
const customerController = new CustomerController();
const eventPushHelperController = new EventPushHelperController();
const orderHelperController = new OrderHelperController();
const rebillController = new RebillController();
const registerController = new RegisterController();
const sessionController = new SessionController();

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

	async execute(event) {
		await this.preamble(event)
		const {rebill: rebill_id, creditcard: raw_creditcard} = this.parameters.get('event');

		const account = await accountController.get({id: global.account});
		const rebill = await rebillController.get({id: rebill_id});
		const session = await sessionController.get({id: rebill.parentsession});
		let creditcard;
		if (raw_creditcard) {
			creditcard = await this.persistCreditCard(raw_creditcard, session.customer);
		}
		const register_response = await this.executeBilling(rebill, creditcard);
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

	async persistCreditCard(creditcard_attrs, customer) {
		const creditcard = await creditCardController.assureCreditCard(creditcard_attrs, {hydrate_token: true});
		await customerController.addCreditCard(customer, creditcard);
		return creditcard;
	}

	async executeBilling(rebill, creditcard) {
		try {
			return registerController.processTransaction({rebill, creditcard});
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

		await eventPushHelperController().pushEvent({
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
