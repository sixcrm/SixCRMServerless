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

	async executeBulk(parameters) {

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
					return this.execute({guid: guid, stateMachineName: parameters.stateMachineName});
				}catch(error){
					return error;
				}
			}
		});

		return arrayutilities.serial(bulk_promises);

	}

	async execute(parameters) {

		du.debug('execute');

		this.validateInput(parameters);

		const to_state = this.getStateMachineName(parameters);

		//Note:  This is a bit confusing -  it means that there are two fields named "stateMachineName", one at the root and one in input, when the stateMachineName is provided in the parameters object
		const params = {
			stateMachineName: to_state,
			input: parameters
		};

		const stateMachineHelperController = new StateMachineHelperController();
		return stateMachineHelperController.startExecution({parameters: params});

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
