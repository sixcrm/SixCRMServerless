const _ = require('lodash');
const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const eu = require('@sixcrm/sixcrmcore/util/error-utilities').default;
const objectutilities = require('@sixcrm/sixcrmcore/util/object-utilities').default;
const arrayutilities = require('@sixcrm/sixcrmcore/util/array-utilities').default;
const random = require('@sixcrm/sixcrmcore/util/random').default;
const hashutilities = require('@sixcrm/sixcrmcore/util/hash-utilities').default;
const timestamp = require('@sixcrm/sixcrmcore/util/timestamp').default;

const StepFunctionProvider = global.SixCRM.routes.include('providers', 'stepfunction-provider.js');
const StateController = global.SixCRM.routes.include('entities', 'State.js');
const StateHelperController = global.SixCRM.routes.include('helpers','entities/state/State.js');

module.exports = class StateMachineHelperController {

	constructor() {

		this.stepfunctionprovider = new StepFunctionProvider();

	}

	async getRunningExecutions({id, state}){

		du.debug('Get Running Executions');

		let running_executions = await this.getExecutions({id: id, state: state, status: 'RUNNING'});

		if(_.isArray(running_executions) && arrayutilities.nonEmpty(running_executions)){
			return running_executions;
		}

		return null;

	}

	async getExecutions({id, state, status = null}){

		du.debug('Get Executions');

		let known_executions = await (new StateController()).listByEntityAndState({entity: id, state: state});

		if(!_.has(known_executions, 'states') || !_.isArray(known_executions.states) || !arrayutilities.nonEmpty(known_executions.states)){
			return null;
		}

		if(!_.isNull(status)){
			return this.filterExecutionsByStatus({executions: known_executions.states, status: status});
		}

		return known_executions;

	}

	async filterExecutionsByStatus({executions, status}){

		du.debug('Filter Executions By Status');

		if(!_.includes(["RUNNING", "SUCCEEDED", "FAILED", "TIMED_OUT", "ABORTED"], status)){
			throw eu.getError('server', 'Unknown execution status: '+status);
		}

		const stateHelperController = new StateHelperController();

		//Note:  There may be AWS throttling here...
		let status_promises = arrayutilities.map(executions, execution => {
			let execution_arn = stateHelperController.buildExecutionArn(execution);
			return this.stepfunctionprovider.describeExecution({
				executionArn: execution_arn
			});
		});

		let stati = await Promise.all(status_promises);

		let status_relevant_executions = arrayutilities.filter(stati, stati_result => {
			return (_.has(stati_result, 'status') && stati_result.status == status);
		});

		if(_.isArray(status_relevant_executions) && arrayutilities.nonEmpty(status_relevant_executions)){
			return arrayutilities.map(status_relevant_executions, status_relevant_execution => {
				return arrayutilities.find(executions, execution => {
					return (execution.execution == status_relevant_execution.name);
				});
			});
		}

		return null;

	}

	async stopExecutions(executions = null){

		du.debug('Stop Executions');

		if(!_.isArray(executions) || !arrayutilities.nonEmpty(executions)){
			throw eu.getError('server', 'stopExecutions() assumes executions parameters is a non-empty array.');
		}

		const stateHelperController = new StateHelperController();

		let stop_promises = arrayutilities.map(executions, (execution_id) => {
			return this.stepfunctionprovider.stopExecution({
				executionArn: stateHelperController.buildExecutionArn(execution_id)
			});
		});

		return Promise.all(stop_promises);

	}

	async startExecution({parameters, fatal = true}) {

		du.debug('Start Execution');

		let identifier = this.getIdentifier();

		this.addName(parameters, identifier);
		this.addExecutionID(parameters, identifier);
		this.addStateMachineArn(parameters);
		this.rectifyStateMachineNames(parameters);
		await this.addAccount(parameters);

		this.normalizeInput(parameters);

		let result = await new StateHelperController().report({
			account: parameters.account,
			entity: JSON.parse(parameters.input).guid,
			name: parameters.stateMachineName,
			step: 'Start',
			execution: parameters.name
		});

		if(!_.isObject(result) || !_.has(result, 'id')){
			throw eu.getError('server', 'Unable to create state machine record "Start"');
		}

		try {

			return await this.stepfunctionprovider.startExecution(parameters);

		}catch(error){

			let result = await new StateHelperController().report({
				account: parameters.account,
				entity: JSON.parse(parameters.input).guid,
				name: parameters.stateMachineName,
				step: 'Start Failed',
				execution: parameters.name,
				message: error.message
			});

			if(!_.isObject(result) || !_.has(result, 'id')){
				throw eu.getError('server', 'Unable to create state machine record: "Start Failed"');
			}

			if(fatal == true){
				throw error;
			}

			du.error(error);

			return error;

		}

	}

	async addAccount(parameters){

		du.debug('Add Account');

		let account = await this.getAccount(parameters);

		if(!_.isNull(account)){
			parameters.account = account;
			return;
		}

		throw eu.getError('server', 'Unable to acquire account.');

	}

	async getAccount(parameters /*, fatal = true*/) {

		du.debug('Get Account');

		if (_.has(parameters, 'account')) {
			return parameters.account;
		}

		let guid = this.getGUID(parameters);

		let entity_type = this.getEntityType(parameters);

		if(_.isNull(entity_type)){

			let entity = await {
				rebill: () => this.getRebill(guid),
				session: () => this.getSession(guid),
				shipping_receipt: () => this.getShippingReceipt(guid)
			}[_.toLower(entity_type)]();

			if (!_.isNull(entity) && _.has(entity, 'account')) {
				return entity.account;
			}

		}else{

			let results = await Promise.all([
				this.getRebill(guid, false),
				this.getSession(guid, false),
				this.getShippingReceipt(guid, false)
			]);

			let found = arrayutilities.find(results, result => {
				return (_.has(result, 'account'));
			});

			if (_.has(found, 'account')) {
				return found.account;
			}

		}

		return null;

	}

	getGUID(parameters, fatal = true){

		du.debug('Get GUID');

		let guid = null;

		if (_.has(parameters, 'input') && _.has(parameters.input, 'guid')) {
			guid = parameters.input.guid;
		} else if (_.has(parameters, 'guid')) {
			guid = parameters.guid;
		}

		if(_.isNull(guid) && fatal == true){
			throw eu.getError('server', 'Unable to acquire guid property');
		}

		du.warning('Unable to acquire guid property');

		return guid;

	}

	getEntityType(parameters){

		du.debug('Get Entity Type');

		if(_.has(parameters, 'entity_type')){
			return parameters.entity_type;
		}

		if(_.has(parameters, 'stateMachineName')){
			return this.getEntityInputTypeFromStateMachineName(parameters.stateMachineName);
		}

		return null;

	}

	getEntityInputTypeFromStateMachineName(state_machine_name){

		du.debug('Get Entity Input Type From State Machine');

		let translation = {
			rebill: ['Billing', 'Recovery', 'Prefulfillment', 'Fulfillment', 'Postfulfillment'],
			shipping_receipt:['Tracking'],
			session:['Closesession', 'Createrebill']
		};

		let entity_input_type = null;

		objectutilities.map(translation, key => {
			if(_.isNull(entity_input_type) && _.includes(translation[key], state_machine_name)){
				entity_input_type = key;
			}
		});

		return entity_input_type;

	}

	async getShippingReceipt(id, fatal = true){

		du.debug('Get Shipping Receipt');

		if(!_.has(this, 'shippingReceiptController')){
			const ShippingReceiptController = global.SixCRM.routes.include('entities', 'ShippingReceipt.js');
			this.shippingReceiptController = new ShippingReceiptController();
		}

		let shipping_receipt = await this.shippingReceiptController.get({id: id});

		if(_.isNull(shipping_receipt)){
			if(fatal){
				throw eu.getError('server', 'Unable to acquire a shipping receipt that matches '+id);
			}

			du.warning('Unable to acquire a shipping receipt that matches '+id);

		}

		return shipping_receipt;

	}

	async getRebill(id, fatal = true){

		du.debug('Get Rebill');

		if(!_.has(this, 'rebillController')){
			const RebillController = global.SixCRM.routes.include('entities', 'Rebill.js');
			this.rebillController = new RebillController();
		}

		let rebill = await this.rebillController.get({id: id});

		if(_.isNull(rebill)){
			if(fatal){
				throw eu.getError('server', 'Unable to acquire a rebill that matches '+id);
			}

			du.warning('Unable to acquire a rebill that matches '+id);

		}

		return rebill;

	}

	async getSession(id, fatal = true){

		du.debug('Get Session');

		if(!_.has(this, 'sessionController')){
			const SessionController = global.SixCRM.routes.include('entities', 'Session.js');
			this.sessionController = new SessionController();
		}

		let session = await this.sessionController.get({id: id});

		if(_.isNull(session)){
			if(fatal){
				throw eu.getError('server', 'Unable to acquire a session that matches '+id);
			}

			du.warning('Unable to acquire a session that matches '+id);

		}

		return session;

	}

	addName(parameters, identifier){

		du.debug('Add Name');

		parameters.name = identifier;

	}

	addStateMachineArn(parameters){

		du.debug('Add State Machine Arn');

		parameters.stateMachineArn = this.stepfunctionprovider.createStateMachineARN(parameters.stateMachineName);

	}

	addExecutionID(parameters, identifier){

		du.debug('Add Execution ID');

		if(_.has(parameters, 'input')){
			parameters.input.executionid = identifier;
		}else{
			parameters.input = {executionid: identifier};
		}

	}

	rectifyStateMachineNames(parameters){

		du.debug('Rectify State Machine Names');

		if(_.has(parameters, 'input')){

			if(_.has(parameters, 'stateMachineName') && _.has(parameters.input, 'stateMachineName')){

				if(parameters.stateMachineName !== parameters.input.stateMachineName){
					parameters.input.stateMachineName = parameters.stateMachineName;
				}

			}

		}

	}

	normalizeInput(parameters){

		du.debug('Normalize Input');

		if(_.has(parameters, 'input')){

			if(!_.isString(parameters.input)){
				parameters.input = JSON.stringify(parameters.input);
			}

		}

	}

	getIdentifier() {

		du.debug('Get Identifier');

		return hashutilities.toSHA1(random.createRandomString(20)+timestamp.now());

	}

}
