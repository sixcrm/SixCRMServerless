const StepFunctionHandler = require('./stepfunction-handler');

const GetTrackingInformationController = global.SixCRM.routes.include('controllers', 'workers/statemachine/getTrackingInformation.js');
const SendDeliveryNotificationController = global.SixCRM.routes.include('controllers', 'workers/statemachine/sendDeliveryNotification.js');
const GetTrackingNumberController = global.SixCRM.routes.include('controllers', 'workers/statemachine/getTrackingNumber.js');
const TriggerTrackingController = global.SixCRM.routes.include('controllers', 'workers/statemachine/triggerTracking.js');

module.exports = {
	gettrackinginformation: handleStepFunction((event) => new GetTrackingInformationController().execute(event)),
	senddeliverynotification: handleStepFunction((event) => new SendDeliveryNotificationController().execute(event)),
	gettrackingnumber: handleStepFunction((event) => new GetTrackingNumberController().execute(event)),
	triggertracking: handleStepFunction((event) => new TriggerTrackingController().execute(event)),
};

function handleStepFunction(delegate) {
	return (event, context, callback) => new StepFunctionHandler().handle(event, context, callback, delegate);
}
