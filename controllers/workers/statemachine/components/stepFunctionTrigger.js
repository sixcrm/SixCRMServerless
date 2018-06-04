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
			stateMachineName: this.next_state,
			input:JSON.stringify(input)
		};

		let stateMachineHelperController = new StateMachineHelperController();
		let result = await stateMachineHelperController.startExecution(parameters);

		return result;

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
