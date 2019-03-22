const _ = require('lodash');
const uuidV4 = require('uuid/v4');
const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;
const timestamp = require('@6crm/sixcrmcore/lib/util/timestamp').default;
const random = require('@6crm/sixcrmcore/lib/util/random').default;
const arrayutilities = require('@6crm/sixcrmcore/lib/util/array-utilities').default;
const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');
const SQSProvider = global.SixCRM.routes.include('controllers', 'providers/sqs-provider.js');
const AnalyticsEvent = global.SixCRM.routes.include('helpers', 'analytics/analytics-event.js')

module.exports = class RebillHelper {

	constructor() {
		this.parameter_definition = {
			updateRebillState: {
				required: {
					rebill: 'rebill',
					newstate: 'new_state'
				},
				optional: {
					errormessage: 'error_message',
					previousstate: 'previous_state'
				}
			},
			getShippingReceipts: {
				required: {
					rebill: 'rebill'
				},
				optional: {}
			},
			updateRebillProcessing: {
				required: {
					rebill: 'rebill',
					processing: 'processing'
				},
				optional: {}
			},
			addRebillToQueue: {
				required: {
					rebill: 'rebill',
					queuename: 'queue_name'
				},
				optional: {}
			},
			updateRebillUpsell: {
				required: {
					rebill: 'rebill',
					upsell: 'upsell'
				}
			},
		};

		this.parameter_validation = {
			'session': global.SixCRM.routes.path('model', 'entities/session.json'),
			'day': global.SixCRM.routes.path('model', 'helpers/rebill/day.json'),
			'billdate': global.SixCRM.routes.path('model', 'definitions/iso8601.json'),
			'nextproductschedulebilldaynumber': global.SixCRM.routes.path('model', 'helpers/rebill/day.json'),
			'productschedules': global.SixCRM.routes.path('model', 'helpers/rebill/productschedules.json'),
			'products': global.SixCRM.routes.path('model', 'helpers/rebill/products.json'),
			'normalizedproductschedules': global.SixCRM.routes.path('model', 'helpers/rebill/normalizedproductschedules.json'),
			'normalizedproducts': global.SixCRM.routes.path('model', 'helpers/rebill/normalizedproducts.json'),
			'scheduleelementsonbillday': global.SixCRM.routes.path('model', 'helpers/rebill/scheduledproducts.json'),
			'transactionproducts': global.SixCRM.routes.path('model', 'helpers/rebill/transactionproducts.json'),
			'amount': global.SixCRM.routes.path('model', 'definitions/currency.json'),
			'rebillprototype': global.SixCRM.routes.path('model', 'helpers/rebill/rebillprototype.json'),
			'rebill': global.SixCRM.routes.path('model', 'entities/rebill.json'),
			'upsell': global.SixCRM.routes.path('model', 'entities/rebill.json'),
			'transformedrebill': global.SixCRM.routes.path('model', 'entities/transformedrebill.json'),
			'billablerebills': global.SixCRM.routes.path('model', 'helpers/rebill/billablerebills.json'),
			'spoofedrebillmessages': global.SixCRM.routes.path('model', 'helpers/rebill/spoofedrebillmessages.json'),
			'queuename': global.SixCRM.routes.path('model', 'workers/queuename.json'),
			'queuemessagebodyprototype': global.SixCRM.routes.path('model', 'definitions/stringifiedjson.json'),
			'statechangedat': global.SixCRM.routes.path('model', 'definitions/iso8601.json'),
			'updatedrebillprototype': global.SixCRM.routes.path('model', 'helpers/rebill/updatedrebillprototype.json'),
			'newstate': global.SixCRM.routes.path('model', 'workers/statename.json'),
			'previousstate': global.SixCRM.routes.path('model', 'workers/statename.json'),
			'errormessage': global.SixCRM.routes.path('model', 'helpers/rebill/errormessage.json'),
			'shippingreceipts': global.SixCRM.routes.path('model', 'entities/components/shippingreceipts.json'),
			'shippingreceiptids': global.SixCRM.routes.path('model', 'general/uuidv4list.json'),
			'transactions': global.SixCRM.routes.path('model', 'entities/components/transactions.json')
		};

		this.parameters = new Parameters({
			validation: this.parameter_validation,
			definition: this.parameter_definition
		});

	}

	setParameters({
		argumentation,
		action
	}) {
		this.parameters.setParameters({
			argumentation: argumentation,
			action: action
		});

		return Promise.resolve(true);

	}

	async getMostRecentRebill({session, on_or_before = timestamp.getISO8601()}){
		if(!_.has(this, 'rebillController')){
			const RebillController = global.SixCRM.routes.include('entities', 'Rebill.js');
			this.rebillController = new RebillController();
		}

		const query_parameters = {
			filter_expression: '#bill_atk <= :bill_atv',
			expression_attribute_names: {
				'#bill_atk': 'bill_at'
			},
			expression_attribute_values:{
				':bill_atv': on_or_before
			}
		};

		let result = await this.rebillController.queryBySecondaryIndex({query_parameters: query_parameters, field:'parentsession', index_name: 'parentsession-index', index_value: session.id, });

		if(!_.has(result, 'rebills')){
			throw eu.getError('server', 'Unexpected response.');
		}

		if(!_.isArray(result.rebills) || !arrayutilities.nonEmpty(result.rebills)){
			return null;
		}

		return arrayutilities.sort(result.rebills, (a,b) => {return (b.bill_at - a.bill_at)})[0];

	}


	updateRebillProcessing() {
		return Promise.resolve()
			.then(() => this.parameters.setParameters({
				argumentation: arguments[0],
				action: 'updateRebillProcessing'
			}))
			.then(() => this.acquireRebill())
			.then(() => this.setRebillProcessing())
			.then(() => this.updateRebill());

	}

	acquireRebill() {
		let rebill = this.parameters.get('rebill');

		if (!_.has(this, 'rebillController')) {
			const RebillController = global.SixCRM.routes.include('entities', 'Rebill.js');
			this.rebillController = new RebillController();
		}

		return this.rebillController.get({
			id: rebill.id
		}).then(rebill => {
			this.parameters.set('rebill', rebill);
			return true;
		});

	}

	setRebillProcessing() {
		let rebill = this.parameters.get('rebill');
		let processing = this.parameters.get('processing');

		rebill.processing = processing;

		this.parameters.set('rebill', rebill);

		return true;

	}

	updateRebill() {
		let rebill = this.parameters.get('rebill');

		if (!_.has(this, 'rebillController')) {
			const RebillController = global.SixCRM.routes.include('controllers', 'entities/Rebill.js');
			this.rebillController = new RebillController();
		}

		return this.rebillController.update({
			entity: rebill
		}).then(rebill => {

			this.parameters.set('rebill', rebill);

			return true;

		});

	}

	updateRebillState() {
		return Promise.resolve()
			.then(() => this.parameters.setParameters({
				argumentation: arguments[0],
				action: 'updateRebillState'
			}))
			.then(() => this.acquireRebill())
			.then(() => this.setConditionalProperties())
			.then(() => this.buildUpdatedRebillPrototype())
			.then(() => this.updateRebillFromUpdatedRebillPrototype())
			.then(() => this.pushRebillStateChangeEvent());

	}

	setConditionalProperties() {
		if (!this.parameters.isSet('newstate')) {
			return true;
		}

		let rebill = this.parameters.get('rebill');

		if (!this.parameters.isSet('previousstate') && !_.isUndefined(rebill.state) && rebill.state) {
			this.parameters.set('previousstate', rebill.state);
		}

		return true;

	}

	updateRebillUpsell() {
		return Promise.resolve()
			.then(() => this.parameters.setParameters({
				argumentation: arguments[0],
				action: 'updateRebillUpsell'
			}))
			.then(() => this.acquireRebill())
			.then(() => this.setRebillUpsell())
			.then(() => this.updateRebill());
	}

	setRebillUpsell() {
		if (!_.has(this, 'rebillController')) {
			const RebillController = global.SixCRM.routes.include('controllers', 'entities/Rebill.js');
			this.rebillController = new RebillController();
		}

		const rebill = this.parameters.get('rebill');
		const upsell = this.parameters.get('upsell');
		rebill.upsell = this.rebillController.getID(upsell);
	}

	buildUpdatedRebillPrototype() {
		let rebill = this.parameters.get('rebill');

		this.parameters.set('statechangedat', timestamp.getISO8601());

		rebill.state = this.parameters.get('newstate');
		rebill.state_changed_at = this.parameters.get('statechangedat');
		rebill.history = this.createUpdatedHistoryObjectPrototype();

		//Technical Debt: note that this doesn't appear to be set every time!
		if (this.parameters.isSet('previousstate')) {
			rebill.previous_state = this.parameters.get('previousstate');
		}

		this.parameters.set('updatedrebillprototype', rebill);

		return true;

	}

	createUpdatedHistoryObjectPrototype() {
		let rebill = this.parameters.get('rebill');

		if (_.has(rebill, 'history') && arrayutilities.nonEmpty(rebill.history)) {

			rebill.history = this.updateHistoryPreviousStateWithNewExit();

		} else {

			rebill.history = [];

		}

		let new_history_element = this.createHistoryElementPrototype({});

		rebill.history.push(new_history_element);

		return rebill.history;

	}

	updateHistoryPreviousStateWithNewExit() {
		let rebill = this.parameters.get('rebill');

		let last_matching_state = this.getLastMatchingStatePrototype();

		arrayutilities.find(rebill.history, (history_element, index) => {
			if ((history_element.state == last_matching_state.state) && (history_element.entered_at == last_matching_state.entered_at)) {
				rebill.history[index] = last_matching_state;
			}
		});

		return rebill.history;

	}

	getLastMatchingStatePrototype() {
		let rebill = this.parameters.get('rebill');
		let previous_state = this.parameters.get('previousstate');
		let state_changed_at = this.parameters.get('statechangedat');

		let matching_states = arrayutilities.filter(rebill.history, (history_element) => {
			return (history_element.state == previous_state)
		});

		if (!arrayutilities.nonEmpty(matching_states)) {

			du.warning('Rebill does not have a history of being in previous state: ' + previous_state);

			matching_states.push(this.createHistoryElementPrototype({
				state: previous_state,
				entered_at: state_changed_at,
				error_message: 'Rebill had no previous history of being in this state.'
			}));

		}

		matching_states = arrayutilities.sort(matching_states, (a, b) => {
			return (a.entered_at - b.entered_at);
		});

		let last_matching_state = matching_states[matching_states.length - 1];

		last_matching_state.exited_at = state_changed_at;

		return last_matching_state;

	}

	createHistoryElementPrototype({
		state,
		entered_at,
		exited_at,
		error_message
	}) {
		state = (!_.isUndefined(state) && !_.isNull(state)) ? state : this.parameters.get('newstate');
		entered_at = (!_.isUndefined(entered_at) && !_.isNull(entered_at)) ? entered_at : this.parameters.get('statechangedat');
		exited_at = (!_.isUndefined(exited_at) && !_.isNull(exited_at)) ? exited_at : this.parameters.get('exitedat', {fatal: false});
		error_message = (!_.isUndefined(error_message)) ? error_message : this.parameters.get('errormessage', {fatal: false});

		let history_element = {
			entered_at: entered_at,
			state: state
		};

		if (!_.isNull(error_message)) {
			history_element.error_message = error_message;
		}

		if (!_.isNull(exited_at)) {
			history_element.exited_at = exited_at;
		}

		return history_element;

	}

	updateRebillFromUpdatedRebillPrototype() {
		let updated_rebill_prototype = this.parameters.get('updatedrebillprototype');

		if (!_.has(this, 'rebillController')) {
			const RebillController = global.SixCRM.routes.include('controllers', 'entities/Rebill.js');
			this.rebillController = new RebillController();
		}

		return this.rebillController.update({
			entity: updated_rebill_prototype
		}).then(updated_rebill => {

			this.parameters.set('rebill', updated_rebill);

			return updated_rebill;

		});

	}

	getAvailableRebillsAsMessages() {
		return this.getBillableRebills()
			.then(() => this.spoofRebillMessages())
			.then(() => {
				return this.parameters.get('spoofedrebillmessages');
			})

	}

	spoofRebillMessages() {
		let billable_rebills = this.parameters.get('billablerebills');

		let spoofed_rebill_messages = [];

		if (arrayutilities.nonEmpty(billable_rebills)) {

			spoofed_rebill_messages = arrayutilities.map(billable_rebills, rebill => {

				return this.createRebillMessageSpoof(rebill);

			});

		}

		this.parameters.set('spoofedrebillmessages', spoofed_rebill_messages);

		return true;

	}

	createRebillMessageSpoof(rebill) {
		let body = JSON.stringify({
			id: rebill.id
		});

		let spoofed_message = {
			MessageId: uuidV4(),
			MD5OfBody: "",
			ReceiptHandle: "",
			Body: body,
			spoofed: true
		};

		return spoofed_message;

	}

	getBillableRebills() {
		let now = timestamp.createDate();

		if (!_.has(this, 'rebillController')) {
			const RebillController = global.SixCRM.routes.include('controllers', 'entities/Rebill.js')
			this.rebillController = new RebillController();
		}

		return this.rebillController.getRebillsAfterTimestamp(now).then(rebills => {

			let billable_rebills = arrayutilities.filter(rebills, (rebill) => {
				if (_.has(rebill, 'upsell')) {
					return false;
				}
				if (!_.has(rebill, 'processing') || rebill.processing !== true) {
					return true;
				}
				return false;
			})

			this.parameters.set('billablerebills', billable_rebills);

			return true;

		});

	}

	addRebillToQueue() {
		return Promise.resolve()
			.then(() => this.parameters.setParameters({
				argumentation: arguments[0],
				action: 'addRebillToQueue'
			}))
			.then(() => this.acquireRebill())
			.then(() => this.createQueueMessageBodyPrototype())
			.then(() => this.addQueueMessageToQueue());

	}

	addQueueMessageToQueue() {
		let message_body = this.parameters.get('queuemessagebodyprototype');
		let queue_name = this.parameters.get('queuename');

		this.sqsprovider = new SQSProvider();
		return this.sqsprovider.sendMessage({
			message_body: message_body,
			queue: queue_name
		}).then(() => {

			return true;

		});

	}

	createQueueMessageBodyPrototype() {
		let rebill = this.parameters.get('rebill');

		let queue_message_body_prototype = JSON.stringify({
			id: rebill.id
		});

		this.parameters.set('queuemessagebodyprototype', queue_message_body_prototype);

		return true;

	}

	getShippingReceipts() {
		return Promise.resolve(true)
			.then(() => this.setParameters({
				argumentation: arguments[0],
				action: 'getShippingReceipts'
			}))
			.then(() => this.acquireRebill())
			.then(() => this.acquireTransactions())
			.then(() => this.getShippingReceiptIDs())
			.then(() => this.acquireShippingReceipts())
			.then(() => {

				let shipping_receipts = this.parameters.get('shippingreceipts', {fatal: false});

				if (_.isNull(shipping_receipts)) {
					shipping_receipts = [];
				}
				return shipping_receipts;
			});

	}

	acquireTransactions() {
		let rebill = this.parameters.get('rebill');

		if (!_.has(this, 'rebillController')) {
			const RebillController = global.SixCRM.routes.include('controllers', 'entities/Rebill.js');
			this.rebillController = new RebillController();
		}

		return this.rebillController.listTransactions(rebill)
			.then((results) => this.rebillController.getResult(results, 'transactions'))
			.then(transactions => {

				if (!_.isNull(transactions)) {
					this.parameters.set('transactions', transactions);
				}

				return true;

			});

	}

	getShippingReceiptIDs() {
		let transactions = this.parameters.get('transactions', {fatal: false});

		if (_.isNull(transactions)) {
			return true;
		}

		let shipping_receipt_ids = arrayutilities.map(transactions, transaction => {

			return arrayutilities.map(transaction.products, transaction_product => {

				if (_.has(transaction_product, 'shipping_receipt')) {
					return transaction_product.shipping_receipt;
				}

			});

		});

		shipping_receipt_ids = arrayutilities.flatten(shipping_receipt_ids);
		shipping_receipt_ids = arrayutilities.unique(shipping_receipt_ids);
		shipping_receipt_ids = arrayutilities.filter(shipping_receipt_ids, shipping_receipt_id => {
			if (_.isUndefined(shipping_receipt_id) || _.isNull(shipping_receipt_ids)) {
				return false;
			}
			return true;
		});

		if (arrayutilities.nonEmpty(shipping_receipt_ids)) {
			this.parameters.set('shippingreceiptids', shipping_receipt_ids);
		}

		return true;

	}

	acquireShippingReceipts() {
		let shipping_receipt_ids = this.parameters.get('shippingreceiptids', {fatal: false});

		if (_.isNull(shipping_receipt_ids)) {
			return true;
		}

		if (!_.has(this, 'shippingReceiptController')) {
			const ShippingReceiptController = global.SixCRM.routes.include('entities', 'ShippingReceipt.js');
			this.shippingReceiptController = new ShippingReceiptController();
		}

		return this.shippingReceiptController.batchGet({
			ids: shipping_receipt_ids
		})
			.then(shipping_receipts => {

				if (!_.isNull(shipping_receipts)) {
					this.parameters.set('shippingreceipts', shipping_receipts);
				}

				return true;

			});

	}

	async pushRebillStateChangeEvent() {
		await this.transformRebill();
		await AnalyticsEvent.push('rebill', { transformedrebill: this.parameters.get('transformedrebill', {fatal: false})});
		return this.parameters.get('rebill');

	}

	transformRebill() {

		const rebill = this.parameters.get('rebill');

		// A.Zelen
		// For summary amounts in queries we need amount of rebills to be feed here
		// I hard-coded zero

		const transformedRebill = {
			id: rebill.id,
			current_queuename: rebill.state,
			previous_queuename: rebill.previous_state || '',
			account: rebill.account,
			datetime: rebill.state_changed_at,
			amount: 0
		};

		this.parameters.set('transformedrebill', transformedRebill);

		return Promise.resolve();
	}

	isAvailable({
		rebill
	}) {
		let bill_at_timestamp = timestamp.dateToTimestamp(rebill.bill_at);

		return !(timestamp.getTimeDifference(bill_at_timestamp) < 0);

	}

	createAlias(){
		return 'R'+random.createRandomString(9);

	}

	getYearMonth(bill_at){
		return bill_at.substring(0,7).replace('-', '');

	}

	async getAvailableRebills(now = timestamp.getISO8601(), last_evaluated_key = null){
		if(!_.has(this, 'rebillController')){
			const RebillController = global.SixCRM.routes.include('entities','Rebill.js');
			this.rebillController = new RebillController();
		}

		let query_parameters = {
			key_condition_expression: '#bill_atk < :bill_atv',
			filter_expression: 'attribute_not_exists(#processingk) OR #processingk <> :processingv',
			expression_attribute_names: {
				'#bill_atk': 'bill_at',
				'#processingk':'processing'
			},
			expression_attribute_values: {
				":bill_atv": now,
				":processingv": true
			},
			projection_expression: 'id, year_month, bill_at'
		};

		if(!_.isNull(last_evaluated_key)){
			query_parameters.exclusive_start_key = last_evaluated_key;
		}

		let results = await this.rebillController.queryBySecondaryIndex({query_parameters: query_parameters, field: 'year_month', index_name: 'year_month_bill_at-index', index_value: this.getYearMonth(now)});

		let return_array = [];

		if(!_.has(results, 'rebills')){
			throw eu.getError('server', 'Unknown response structure - missing property "rebills" on results object: '+JSON.stringify(results));
		}

		if(!_.isNull(results.rebills) && !_.isArray(results.rebills)){
			throw eu.getError('server', 'Unknown response structure - results.rebills is assumed to be a non-null array: '+JSON.stringify(results.rebills));
		}

		if(_.isArray(results.rebills) && arrayutilities.nonEmpty(results.rebills)){
			arrayutilities.map(results.rebills, rebill => {

				if(!_.has(rebill, 'id')){
					throw eu.getError('server', 'Bad structure: '+JSON.stringify(rebill));
				}

				return_array.push(rebill.id);

			});
		}

		if(!_.has(results, 'pagination')){
			throw eu.getError('server', 'Bad structure: '+JSON.stringify(results));
		}

		if(!_.has(results.pagination, 'has_next_page')){
			throw eu.getError('server', 'Bad structure, no "has_next_page" property: '+JSON.stringify(results));
		}

		if(results.pagination.has_next_page == 'true'){

			if(!_.has(results.pagination, 'last_evaluated')){
				throw eu.getError('server', 'Bad structure, no "last_evaluated" property: '+JSON.stringify(results));
			}

			const last_evaluated = JSON.parse(results.pagination.last_evaluated);

			if(!_.has(last_evaluated, 'id')){
				throw eu.getError('server', 'Bad structure, no "id" property: '+JSON.stringify(last_evaluated));
			}

			let additional_results = await this.getAvailableRebills(now, last_evaluated);

			if(arrayutilities.nonEmpty(additional_results)){
				return_array = arrayutilities.merge(return_array, additional_results);
			}

		}

		return return_array;

	}

	calculateDayInCycle(created_at){
		if(_.isUndefined(created_at) || _.isNull(created_at)){

			created_at = null;

			let session = this.parameters.get('session', {fatal: false});

			if(!_.isNull(session)){

				created_at = session.created_at;

			}

		}

		if(timestamp.isISO8601(created_at)){

			let day = timestamp.getDaysDifference(created_at);

			this.parameters.set('day', day);

			return day;

		}

		throw eu.getError('server', 'created_at is not a proper ISO-8601');

	}

};
