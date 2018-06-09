const StepFunctionHandler = require('./stepfunction-handler');

const GetTrackingInformationController = global.SixCRM.routes.include('controllers', 'workers/statemachine/getTrackingInformation.js');
const GetSessionClosedController = global.SixCRM.routes.include('controllers', 'workers/statemachine/getSessionClosed.js');
const GetTrackingNumberController = global.SixCRM.routes.include('controllers', 'workers/statemachine/getTrackingNumber.js');
const GetFulfillmentRequiredController = global.SixCRM.routes.include('controllers', 'workers/statemachine/getFulfillmentRequired.js');
const GetRecoverDateController = global.SixCRM.routes.include('controllers', 'workers/statemachine/getRecoverDate.js');

const CleanupDeclineController = global.SixCRM.routes.include('controllers', 'workers/statemachine/cleanupDecline.js');
const BillController = global.SixCRM.routes.include('controllers', 'workers/statemachine/bill.js');
const ReportController = global.SixCRM.routes.include('controllers', 'workers/statemachine/report.js');
const SendDeliveryNotificationController = global.SixCRM.routes.include('controllers', 'workers/statemachine/sendDeliveryNotification.js');
const NotifyFulfillmentProvidersController = global.SixCRM.routes.include('controllers', 'workers/statemachine/notifyFulfillmentProviders.js');
const CloseSessionController = global.SixCRM.routes.include('controllers', 'workers/statemachine/closeSession.js');
const CleanupSessionController = global.SixCRM.routes.include('controllers', 'workers/statemachine/cleanupSession.js');

const TriggerTrackingController = global.SixCRM.routes.include('controllers', 'workers/statemachine/triggers/triggerTracking.js');
const TriggerPostFulfillmentController = global.SixCRM.routes.include('controllers', 'workers/statemachine/triggers/triggerPostFulfillment.js');
const TriggerFulfillmentController = global.SixCRM.routes.include('controllers', 'workers/statemachine/triggers/triggerFulfillment.js');
const TriggerPreFulfillmentController = global.SixCRM.routes.include('controllers', 'workers/statemachine/triggers/triggerPreFulfillment.js');
const TriggerRecoveryController = global.SixCRM.routes.include('controllers', 'workers/statemachine/triggers/triggerRecovery.js');

module.exports = {
	gettrackinginformation: handleStepFunction((event) => new GetTrackingInformationController().execute(event)),
	senddeliverynotification: handleStepFunction((event) => new SendDeliveryNotificationController().execute(event)),
	gettrackingnumber: handleStepFunction((event) => new GetTrackingNumberController().execute(event)),
	notifyfulfillmentproviders: handleStepFunction((event) => new NotifyFulfillmentProvidersController().execute(event)),
	getfulfillmentrequired: handleStepFunction((event) => new GetFulfillmentRequiredController().execute(event)),
	triggerpostfulfillment: handleStepFunction((event) => new TriggerPostFulfillmentController().execute(event)),
	triggerfulfillment: handleStepFunction((event) => new TriggerFulfillmentController().execute(event)),
	triggerprefulfillment: handleStepFunction((event) => new TriggerPreFulfillmentController().execute(event)),
	triggertracking: handleStepFunction((event) => new TriggerTrackingController().execute(event)),
	triggerrecovery: handleStepFunction((event) => new TriggerRecoveryController().execute(event)),
	cleanupdecline: handleStepFunction((event) => new CleanupDeclineController().execute(event)),
	getrecoverdate: handleStepFunction((event) => new GetRecoverDateController().execute(event)),
	bill: handleStepFunction((event) => new BillController().execute(event)),
	getsessionclosed: handleStepFunction((event) => new GetSessionClosedController().execute(event)),
	closesession: handleStepFunction((event) => new CloseSessionController().execute(event)),
	cleanupsession: handleStepFunction((event) => new CleanupSessionController().execute(event)),
	report: handleStepFunction((event) => new ReportController().execute(event)),
};

function handleStepFunction(delegate) {
	return (event, context, callback) => new StepFunctionHandler().handle(event, context, callback, delegate);
}
