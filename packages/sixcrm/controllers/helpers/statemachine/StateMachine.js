const _ = require('lodash');
const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/lib/util/object-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/lib/util/array-utilities').default;
const parserutilities = require('@6crm/sixcrmcore/lib/util/parser-utilities').default;
const random = require('@6crm/sixcrmcore/lib/util/random').default;
const hashutilities = require('@6crm/sixcrmcore/lib/util/hash-utilities').default;
const timestamp = require('@6crm/sixcrmcore/lib/util/timestamp').default;

const StepFunctionProvider = global.SixCRM.routes.include('providers', 'stepfunction-provider.js');

module.exports = class StateMachineHelperController {

	constructor() {

		this.stepfunctionprovider = new StepFunctionProvider();

	}

	async stopExecutions(executions = null){
		if(!_.isArray(executions) || !arrayutilities.nonEmpty(executions)){
			throw eu.getError('server', 'stopExecutions() assumes executions parameters is a non-empty array.');
		}

		let stop_promises = arrayutilities.map(executions, (execution_id) => {
			return this.stepfunctionprovider.stopExecution({
				executionArn: this.buildExecutionArn(execution_id)
			});
		});

		return Promise.all(stop_promises);

	}

	async startExecution({parameters, fatal = true}) {
		let identifier = this.getIdentifier();

		this.addName(parameters, identifier);
		this.addExecutionID(parameters, identifier);
		this.addStateMachineArn(parameters);
		this.rectifyStateMachineNames(parameters);
		await this.addAccount(parameters);

		this.normalizeInput(parameters);

		try {

			return await this.stepfunctionprovider.startExecution(parameters);

		}
		catch(error) {

			if(fatal == true) {
				throw error;
			}

			du.error(error);

			return error;

		}

	}

	buildExecutionArn(execution) {
		if(!_.has(execution, 'name')){
			throw eu.getError('server', 'State requires "name" property in order to build a execution ARN');
		}

		if(!_.has(execution, 'execution')){
			throw eu.getError('server', 'State requires "execution" property in order to build a execution ARN');
		}

		const template = 'arn:aws:states:{{aws_region}}:{{aws_account}}:execution:{{state_machine_name}}:{{execution}}';

		const data = {
			aws_region: global.SixCRM.configuration.site_config.aws.region,
			aws_account: global.SixCRM.configuration.site_config.aws.account,
			state_machine_name: execution.name,
			execution: execution.execution
		};

		return parserutilities.parse(template, data);

	}

	async addAccount(parameters){
		let account = await this.getAccount(parameters);

		if(!_.isNull(account)){
			parameters.account = account;
			return;
		}

		throw eu.getError('server', 'Unable to acquire account.');

	}

	async getAccount(parameters /*, fatal = true*/) {
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
		if(_.has(parameters, 'entity_type')){
			return parameters.entity_type;
		}

		if(_.has(parameters, 'stateMachineName')){
			return this.getEntityInputTypeFromStateMachineName(parameters.stateMachineName);
		}

		return null;

	}

	getEntityInputTypeFromStateMachineName(state_machine_name){
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
		parameters.name = identifier;

	}

	addStateMachineArn(parameters){
		parameters.stateMachineArn = this.stepfunctionprovider.createStateMachineARN(parameters.stateMachineName);

	}

	addExecutionID(parameters, identifier){
		if(_.has(parameters, 'input')){
			parameters.input.executionid = identifier;
		}else{
			parameters.input = {executionid: identifier};
		}

	}

	rectifyStateMachineNames(parameters){
		if(_.has(parameters, 'input')){

			if(_.has(parameters, 'stateMachineName') && _.has(parameters.input, 'stateMachineName')){

				if(parameters.stateMachineName !== parameters.input.stateMachineName){
					parameters.input.stateMachineName = parameters.stateMachineName;
				}

			}

		}

	}

	normalizeInput(parameters){
		if(_.has(parameters, 'input')){

			if(!_.isString(parameters.input)){
				parameters.input = JSON.stringify(parameters.input);
			}

		}

	}

	getIdentifier() {
		return hashutilities.toSHA1(random.createRandomString(20)+timestamp.now());

	}

}
