const StepFunctionTriggerController = global.SixCRM.routes.include('controllers', 'workers/statemachine/components/stepFunctionTrigger.js');

module.exports = class TriggerCreateRebillController extends StepFunctionTriggerController {

	constructor() {

		super();

		this.next_state = 'Createrebill';

	}

}
