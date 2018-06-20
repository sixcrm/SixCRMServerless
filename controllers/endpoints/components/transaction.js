const _ = require('lodash');
const uuid = require('uuid');
const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const eu = require('@sixcrm/sixcrmcore/util/error-utilities').default;
const objectutilities = require('@sixcrm/sixcrmcore/util/object-utilities').default;
const stringutilities = require('@sixcrm/sixcrmcore/util/string-utilities').default;
const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');
const StateMachineHelperController = global.SixCRM.routes.include('helpers','statemachine/StateMachine.js');
const authenticatedController = global.SixCRM.routes.include('controllers', 'endpoints/components/authenticated.js');

module.exports = class transactionEndpointController extends authenticatedController {

	constructor() {

		super();

	}

	initialize() {

		du.debug('Initialize');

		this.parameters = new Parameters({
			validation: this.parameter_validation,
			definition: this.parameter_definitions
		});

		return true;

	}

	preamble(event) {

		du.debug('Preamble');

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

	validateInput(event, validation_function) {

		du.debug('Validate Input');

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

		du.debug('Get Transaction Subtype')

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

		du.debug('Create Transaction Object');

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

		du.debug('Push Event');

		if (_.isUndefined(event_type) || _.isNull(event_type)) {
			if (_.has(this, 'event_type')) {
				event_type = this.event_type;
			} else if (!_.isUndefined(context) && !_.isNull(context) && _.has(context, 'event_type') && _.isString(context.event_type)) {
				event_type = context.event_type;
			} else {
				throw eu.getError('server', 'Unable to identify event_type.');
			}
		}

		if (_.isUndefined(context) || _.isNull(context)) {
			if (objectutilities.hasRecursive(this, 'parameters.store')) {
				context = this.parameters.store;
			} else {
				throw eu.getError('server', 'Unset context.');
			}
		}

		if(!_.has(global, 'user')){
			throw eu.getError('server', 'Global missing "user" property.');
		}

		if (!_.has(this, 'eventHelperController')) {
			const EventHelperController = global.SixCRM.routes.include('helpers', 'events/Event.js');
			this.eventHelperController = new EventHelperController();
		}

		return this.eventHelperController.pushEvent({
			event_type: event_type,
			context: Object.assign(
				{
					id: uuid.v4()
				},
				context,
				{
					user: global.user
				}
			)
		});

	}

	async triggerSessionCloseStateMachine(session, restart = false){

		du.debug('Trigger Session Close State Machine')

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
