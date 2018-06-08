const _ = require('lodash');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
//const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const random = global.SixCRM.routes.include('lib', 'random.js');
const hashutilities = global.SixCRM.routes.include('lib', 'hash-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const StepFunctionProvider = global.SixCRM.routes.include('providers', 'stepfunction-provider.js');

module.exports = class StateMachineHelperController {

	constructor() {

		this.stepfunctionprovider = new StepFunctionProvider();

	}

	async startExecution(parameters, /*restart = false*/) {

		du.debug('Start Execution');

		let identifier = this.getIdentifier();

		parameters.name = identifier;

		this.addExecutionID(parameters, identifier);

		this.normalizeInput(parameters);

		//du.info('Restart: '+restart);
		/*
		Note:  Refactor to use Dynamo Table

		const executionArn = this.stepfunctionprovider.createExecutionARN(parameters.stateMachineName, parameters.name);

		let description = await this.stepfunctionprovider.describeExecution({
			executionArn: executionArn
		});

		if (_.has(description, 'status')) {

			if (restart === true || restart == 'true') {

				await this.stepfunctionprovider.stopExecution({
					executionArn: executionArn
				});

				du.warning('Execution stopped: '+executionArn);

			}else{

				du.warning('Execution already exists, restart configured off.');

				return null;

			}

		}
		*/

		parameters.stateMachineArn = this.stepfunctionprovider.createStateMachineARN(parameters.stateMachineName);

		let start = await this.stepfunctionprovider.startExecution(parameters);
		return start;

	}

	addExecutionID(parameters, identifier){

		du.debug('Add Execution ID');

		if(_.has(parameters, 'input')){
			parameters.input.executionid = identifier;
		}else{
			parameters.input = {executionid: identifier};
		}

	}

	normalizeInput(parameters){

		du.debug('Normalize Input');

		if(_.has(parameters, 'input') && !_.isString(parameters.input)){
			parameters.input = JSON.stringify(parameters.input);
		}

	}

	getIdentifier() {

		du.debug('Get Identifier');

		return hashutilities.toSHA1(random.getRandomString(20)+timestamp.now());

	}

}
