const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

const StateMachineHelperController = global.SixCRM.routes.include('helpers','statemachine/StateMachine.js');

const stepFunctionWorkerController = global.SixCRM.routes.include('controllers', 'workers/components/stepfunctionworker.js');

module.exports = class TriggerTrackingController extends stepFunctionWorkerController {

	constructor() {

		super();

	}

	async execute(event) {

		du.debug('Execute');

		this.validateEvent(event);

		const parameters = {
			stateMachineName: 'Tracking',
			input:JSON.stringify({guid: event.guid})
		};

		let stateMachineHelperController = new StateMachineHelperController();
		let result = await stateMachineHelperController.startExecution(parameters);

		return result;

	}

}
