const _ = require('lodash');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
const stringutilities = require('@6crm/sixcrmcore/util/string-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;

const StateMachineHelperController = global.SixCRM.routes.include('helpers','statemachine/StateMachine.js');

const StepFunctionWorkerController = global.SixCRM.routes.include('controllers', 'workers/statemachine/components/stepFunctionWorker.js');

module.exports = class TriggerController extends StepFunctionWorkerController {

	constructor() {

		super();

	}

	async executeBulk(parameters, restart = false, fatal = false){

		du.debug('Execute Bulk');

		if(!_.has(parameters, 'guids')){
			throw eu.getError('server', 'parameters is assumed to have  property "guids": '+JSON.stringify(parameters));
		}

		if(!_.isArray(parameters.guids)){
			throw eu.getError('server', 'parameters.guids is assumed to be a array: '+JSON.stringify(parameters));
		}

		if(!arrayutilities.nonEmpty(parameters.guids)){
			throw eu.getError('server', 'parameters.guids is assumed to be a array: '+JSON.stringify(parameters));
		}

		let bulk_promises = arrayutilities.map(parameters.guids, (guid) => {
			return () => {
				try{
					return this.execute({guid: guid, stateMachineName: parameters.stateMachineName}, restart, fatal);
				}catch(error){
					return error;
				}
			}
		});

		return arrayutilities.serial(bulk_promises);

	}

	async execute(parameters, restart = false, fatal = false){

		du.debug('execute');

		this.validateInput(parameters);

		const to_state = this.getStateMachineName(parameters);

		//Note:  This is a bit confusing -  it means that there are two fields named "stateMachineName", one at the root and one in input, when the stateMachineName is provided in the parameters object
		const params = {
			stateMachineName: to_state,
			input: parameters
		};

		const stateMachineHelperController = new StateMachineHelperController();

		const running_executions = await stateMachineHelperController.getRunningExecutions({id: parameters.guid, state: to_state});

		if(_.isNull(running_executions)){

			return stateMachineHelperController.startExecution({parameters: params});

		}else{

			if(!_.isArray(running_executions) || !arrayutilities.nonEmpty(running_executions)){
				throw eu.getError('server', 'Unexpected response format: '+JSON.stringify(running_executions));
			}

			if(restart == true){

				try{

					await stateMachineHelperController.stopExecutions(running_executions);

				}catch(error){

					if(fatal == true){
						throw error;
					}

					du.error(error);
					du.warning(error.message);
					return null;

				}

				return stateMachineHelperController.startExecution({parameters: params});

			}

		}

		if(fatal == true){
			throw eu.getError('bad_request', 'There is already another execution running for guid: "'+parameters.guid+'" and state "'+to_state+'".');
		}

		du.warning('There is already another execution running for guid: "'+parameters.guid+'" and state "'+to_state+'".  If you would like to trigger this execution anyhow, set the `restart` argument to true.');
		return null;


	}

	getStateMachineName(input){

		du.debug('Get State Machine Name');

		if(_.has(this, 'next_state')){
			return this.next_state;
		}

		if(_.has(input, 'stateMachineName')){
			return input.stateMachineName;
		}

		throw eu.getError('server', 'Unable to acquire stateMachineName');

	}

	validateInput(input, fatal = true){

		du.debug('Validate Input');

		if(_.has(input, 'guid') && stringutilities.isUUID(input.guid)){
			return true;
		}

		if(fatal == true){
			throw eu.getError('server', 'Bad input: '+JSON.stringify(input));
		}

		return false;

	}

}
