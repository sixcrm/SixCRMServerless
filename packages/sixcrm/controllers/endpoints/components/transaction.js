const _ = require('lodash');

const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;

const stringutilities = require('@6crm/sixcrmcore/lib/util/string-utilities').default;
const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');
const StateMachineHelperController = global.SixCRM.routes.include('helpers','statemachine/StateMachine.js');
const AccountController = global.SixCRM.routes.include('entities', 'Account');
const AccountHelperController = global.SixCRM.routes.include('helpers', 'entities/account/Account.js');
const authenticatedController = global.SixCRM.routes.include('controllers', 'endpoints/components/authenticated.js');

const accountController = new AccountController();
const accountHelperController = new AccountHelperController();

module.exports = class transactionEndpointController extends authenticatedController {

	constructor() {

		super();

	}

	initialize() {
		this.parameters = new Parameters({
			validation: this.parameter_validation,
			definition: this.parameter_definitions
		});

		return true;

	}

	preamble(event) {
		return this.preprocessing(event)
			.then((event) => this.acquireRequestProperties(event))
			.then((event_body) => {
				return this.parameters.setParameters({
					argumentation: {
						event: event_body
					},
					action: 'execute'
				});
			});

	}

	async validateAccount(event) {
		super.validateAccount();
		const account = await accountController.get({ id: global.account });
		if (accountHelperController.isAccountLimited(account)) {
			throw eu.getError('forbidden', 'Account access has been limited and cannot perform this operation.');
		}

		return event;
	}

	validateInput(event, validation_function) {
		return new Promise((resolve, reject) => {

			if (!_.isFunction(validation_function)) {
				return reject(eu.getError('server', 'Validation function is not a function.'));
			}

			if (_.isUndefined(event)) {
				return reject(eu.getError('server', 'Undefined event input.'));
			}

			var params = JSON.parse(JSON.stringify(event || {}));

			let validation = validation_function(params);

			if (_.has(validation, "errors") && _.isArray(validation.errors) && validation.errors.length > 0) {

				du.warning(validation);

				return reject(eu.getError(
					'validation',
					'One or more validation errors occurred.', {
						issues: validation.errors.map((e) => {
							return e.message;
						})
					}
				));

			}

			return resolve(params);

		});

	}

	//Deprecated!
	getTransactionSubType() {
		var order_test = /Order/gi;
		var upsell_test = /Upsell/gi;

		if (order_test.test(this.constructor.name)) {

			return 'main';

		}

		if (upsell_test.test(this.constructor.name)) {

			return 'upsell';

		}

		throw eu.getError('server', 'Unrecognized Transaction Subtype');

	}

	//Technical Debt:  This needs to be in a helper...
	createTransactionObject(info) {
		let transaction_object = {
			id: info.transaction.id,
			datetime: info.transaction.created_at,
			customer: info.customer.id,
			creditcard: info.creditcard.id,
			merchant_provider: info.transaction.merchant_provider,
			campaign: info.campaign.id,
			amount: info.amount,
			processor_result: info.result,
			account: info.transaction.account,
			type: "new",
			subtype: this.getTransactionSubType(),
			product_schedules: info.product_schedules
		};

		if (!_.has(this, 'affiliateHelperController')) {
			const AffiliateHelperController = global.SixCRM.routes.include('helpers', 'entities/affiliate/Affiliate.js');

			this.affiliateHelperController = new AffiliateHelperController();
		}

		return this.affiliateHelperController.transcribeAffiliates(info.session, transaction_object);

	}

	pushEvent({event_type = null, context = null} = {}) {
		if(event_type === null && _.has(this.event_type)){
			event_type = this.event_type;
		}

		if(context === null && _.has(this.parameters)){
			context = this.parameters.store;
		}

		let EventPushHelperController = global.SixCRM.routes.include('helpers', 'events/EventPush.js');
		new EventPushHelperController().pushEvent({event_type: event_type, context: context});

	}

	async triggerSessionCloseStateMachine(session, restart = false){
		if(_.isNull(session) || !_.has(session, 'id') || !stringutilities.isUUID(session.id)){
			throw eu.getError('server', 'Inappropriate Session ID presented to State Machine Helper');
		}

		const parameters = {
			stateMachineName: 'Closesession',
			input:{
				guid: session.id
			},
			account: session.account
		};

		let result = await new StateMachineHelperController().startExecution({parameters: parameters, restart: restart});

		return result;

	}

};
