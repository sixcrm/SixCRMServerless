const StepFunctionTriggerController = global.SixCRM.routes.include('controllers', 'workers/statemachine/components/StepFunctionTrigger.js');

module.exports = class TriggerTrackingController extends StepFunctionTriggerController {

	constructor() {

		super();

		this.next_state = 'Fulfillment';

	}

}
