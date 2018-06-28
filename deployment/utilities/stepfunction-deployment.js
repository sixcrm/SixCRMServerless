const _ = require('lodash');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const fileutilities = require('@6crm/sixcrmcore/util/file-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
const parserutilities = require('@6crm/sixcrmcore/util/parser-utilities').default;

const StepFunctionProvider = global.SixCRM.routes.include('providers', 'stepfunction-provider.js');

const AWSDeploymentUtilities = global.SixCRM.routes.include('deployment', 'utilities/aws-deployment-utilities.js');

module.exports = class StepFunctionDeployment extends AWSDeploymentUtilities{

	constructor() {

		super();

		this.stepFunctionProvider = new StepFunctionProvider();

	}

	async deployStateMachines(){

		du.debug('Deploy State Machines');

		const statemachines = await this.getConfigurationJSON('statemachines');

		let statemachine_promises = arrayutilities.map(statemachines, (statemachine_definition) => {

			let name = _.upperFirst(statemachine_definition.replace('.json', ''));

			statemachine_definition = global.SixCRM.routes.include('deployment', 'stepfunctions/statemachines/'+statemachine_definition);

			return () => this.deployStateMachine(name, statemachine_definition);

		});

		await arrayutilities.serial(statemachine_promises);

		return 'Complete';

	}

	async deployStateMachine(name, statemachine_definition){

		du.debug('Deploy State Machine');

		du.info('Deploying "'+name+'"');

		let exists = await this.stepFunctionProvider.stepFunctionExists(name);

		const account_constants = {
			aws_account_id: global.SixCRM.configuration.site_config.aws.account,
			aws_region: global.SixCRM.configuration.site_config.aws.region,
			stage: global.SixCRM.configuration.stage
		}

		let parameters = {
			name: name,
			roleArn: parserutilities.parse('arn:aws:iam::{{aws_account_id}}:role/sixcrm_statemachine_role', account_constants),
			definition: parserutilities.parse(JSON.stringify(statemachine_definition), account_constants)
		};

		if(exists){
			parameters.stateMachineArn = exists.stateMachineArn;
			return this.stepFunctionProvider.updateStateMachine(parameters);
		}

		return this.stepFunctionProvider.createStateMachine(parameters);

	}

	getConfigurationJSON(directoryname) {

		du.debug('Get Configuration JSON');

		return fileutilities.getDirectoryFiles(global.SixCRM.routes.path('deployment', 'stepfunctions/'+directoryname));

	}

}
