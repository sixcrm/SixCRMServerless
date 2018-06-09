const _ = require('lodash');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');

const StateMachineHelperController = global.SixCRM.routes.include('helpers','statemachine/StateMachine.js');

const StepFunctionWorkerController = global.SixCRM.routes.include('controllers', 'workers/statemachine/components/stepFunctionWorker.js');

module.exports = class TriggerController extends StepFunctionWorkerController {

	constructor() {

		super();

	}

	async execute(input) {

		du.debug('execute');

		this.validateInput(input);

		const parameters = {
			stateMachineName: this.getStateMachineName(input),
			input: input
		};

		return new StateMachineHelperController().startExecution(parameters);

	}

	getStateMachineName(input){

		du.debug('Get State Machine Name');

		if(_.has(input, 'stateMachineName')){
			return input.stateMachineName;
		}

		if(_.has(this, 'next_state')){
			return this.next_state;
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
