const _ = require('lodash');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
//const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const AWSProvider = global.SixCRM.routes.include('controllers', 'providers/aws-provider.js');
const parserutilities = global.SixCRM.routes.include('lib', 'parser-utilities.js');

module.exports = class StepFunctionProvider extends AWSProvider{

	constructor(){

		super();

		//Technical Debt:  Get this out of the constructor?
		this.instantiateAWS();

		this.stepfunction = new this.AWS.StepFunctions({
			apiVersion: '2016-11-23',
			region: this.getRegion()
		});

	}

	async stepFunctionExists(name){

		du.debug('Step Function Exists');

		const parameters = {
		  stateMachineArn: this.createStateMachineARN(name)
		}

		let description = null;

		try{
			description = await this.stepfunction.describeStateMachine(parameters).promise();
		}catch(error){
			if(error.statusCode != '400'){
				throw error;
			}
			return null;
		}

		return description;

	}

	async createStateMachine(parameters){

		du.debug('Create State Machine');

		let params = objectutilities.transcribe(
			{
				name: 'name',
				roleArn: 'roleArn',
				definition: 'definition'
			},
			parameters,
			{},
			true
		);

		if(!_.isString(params.definition)){
			params.definition = JSON.stringify(params.definition);
		}

		return this.stepfunction.createStateMachine(params).promise();

	}

	async updateStateMachine(parameters){

		du.debug('Update State Machine');

		let params = objectutilities.transcribe(
			{
				roleArn: 'roleArn',
				definition: 'definition',
				stateMachineArn: 'stateMachineArn'
			},
			parameters,
			{},
			true
		);

		if(!_.isString(params.definition)){
			params.definition = JSON.stringify(params.definition);
		}

		let result = await this.stepfunction.updateStateMachine(params).promise();

		return result;

	}

	async describeExecution(parameters){

		du.debug('Describe Execution');

		let params = objectutilities.transcribe(
			{
				executionArn: 'executionArn'
			},
			parameters,
			{},
			true
		);

		let result = null;
		try{

			result = await this.stepfunction.describeExecution(params).promise();

		}catch(error){

			if(error.statusCode != 400){

				throw error;

			}

		}

		return result;

	}

	async startExecution(parameters){

		du.debug('Start Execution');

		let params = objectutilities.transcribe(
			{
				stateMachineArn: 'stateMachineArn'
			},
			parameters,
			{},
			true
		);

		params = objectutilities.transcribe(
			{
				name: 'name',
				input: 'input'
			},
			parameters,
			params,
			false
		);

		let result = await this.stepfunction.startExecution(params).promise();

		return result;

	}

	async stopExecution(parameters){

		du.debug('Stop Execution');

		let params = objectutilities.transcribe(
			{
				executionArn: 'executionArn'
			},
			parameters,
			{},
			true
		);

		params = objectutilities.transcribe(
			{
				cause: 'cause',
				error: 'error'
			},
			parameters,
			params,
			false
		);

		let result = await this.stepfunction.stopExecution(params).promise();

		return result;

	}

	createStateMachineARN(name){

		du.debug('Create State Machine ARN');

		const content = 'arn:aws:states:{{aws_region}}:{{aws_account_id}}:stateMachine:{{state_machine_name}}';

		let data = {
			aws_region: global.SixCRM.configuration.site_config.aws.region,
			aws_account_id: global.SixCRM.configuration.site_config.aws.account,
			state_machine_name: name
		};

		return parserutilities.parse(content, data);

	}

	createExecutionARN(name, identifier){

		du.debug('Create Execution ARN');

		const content = 'arn:aws:states:{{aws_region}}:{{aws_account_id}}:execution:{{state_machine_name}}:{{identifier}}';

		let data = {
			aws_region: global.SixCRM.configuration.site_config.aws.region,
			aws_account_id: global.SixCRM.configuration.site_config.aws.account,
			state_machine_name: name,
			identifier: identifier
		};

		return parserutilities.parse(content, data);

	}


}
