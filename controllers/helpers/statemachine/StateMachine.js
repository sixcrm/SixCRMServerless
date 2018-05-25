const _ = require('lodash');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const random = global.SixCRM.routes.include('lib', 'random.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const StepFunctionProvider = global.SixCRM.routes.include('providers', 'stepfunction-provider.js');

module.exports = class StateMachineHelperController {

	constructor() {

		this.stepfunctionprovider = new StepFunctionProvider();

	}

	async startExecution(parameters, restart = false) {

		du.debug('Start Execution');

		const identifier = this.getIdentifier(parameters);
		if (!_.has(parameters, 'name')) {
			parameters.name = this.createExecutionName(identifier);
		}

		const executionArn = this.stepfunctionprovider.createExecutionARN(parameters.stateMachineName, parameters.name);

		let description = await this.stepfunctionprovider.describeExecution({
			executionArn: executionArn
		});

		if (_.has(description, 'status')) {

			if (restart == true) {
				//add restart logic
			}

			du.warning('Execution already exists, restart configured off.');
			du.info(description);
			return null;

		}

		parameters.stateMachineArn = this.stepfunctionprovider.createStateMachineARN(parameters.stateMachineName);

		let start = await this.stepfunctionprovider.startExecution(parameters);
		return start;

	}

	createExecutionName(identifier = random.createRandomString(20)) {

		du.debug('Create Execution Name');

		return [
			identifier,
			timestamp.now()
		].join('@');

	}

	getIdentifier(parameters) {

		du.debug('Get Identifier');

		let input = null;
		let identifier = null;

		if (_.has(parameters, 'input')) {
			if (_.isString(parameters.input)) {
				try {
					input = JSON.parse(parameters.input);
				} catch (error) {
					input = parameters.input;
				}
			} else if (_.isObject(parameters.input)) {
				input = parameters.input;
			} else {
				throw eu.getError('server', 'parameters.input is assumed to be a string or a object');
			}
		}

		if (!_.isNull(input)) {
			du.info(input);
			if (_.has(input, 'guid')) {
				identifier = input.guid;
			} else {
				identifier = input;
			}
		}

		return identifier;

	}

}
