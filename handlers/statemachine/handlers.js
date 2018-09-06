const StepFunctionHandler = require('./stepfunction-handler');

const GetTrackingInformationController = global.SixCRM.routes.include('controllers', 'workers/statemachine/getTrackingInformation.js');
const GetSessionStatusController = global.SixCRM.routes.include('controllers', 'workers/statemachine/getSessionStatus.js');
const GetSessionClosedController = global.SixCRM.routes.include('controllers', 'workers/statemachine/getSessionClosed.js');
//const GetSessionCompleteController = global.SixCRM.routes.include('controllers', 'workers/statemachine/getSessionComplete.js');
const GetTrackingNumberController = global.SixCRM.routes.include('controllers', 'workers/statemachine/getTrackingNumber.js');
const GetFulfillmentRequiredController = global.SixCRM.routes.include('controllers', 'workers/statemachine/getFulfillmentRequired.js');
const GetRecoverDateController = global.SixCRM.routes.include('controllers', 'workers/statemachine/getRecoverDate.js');
const GetSessionRebillController = global.SixCRM.routes.include('controllers', 'workers/statemachine/getSessionRebill.js');
const GetRebillSessionController = global.SixCRM.routes.include('controllers', 'workers/statemachine/getRebillSession.js');

const CloseSessionController = global.SixCRM.routes.include('controllers', 'workers/statemachine/closeSession.js');
const ConcludeSessionController = global.SixCRM.routes.include('controllers', 'workers/statemachine/concludeSession.js');
const CleanupSessionController = global.SixCRM.routes.include('controllers', 'workers/statemachine/cleanupSession.js');

const CleanupDeclineController = global.SixCRM.routes.include('controllers', 'workers/statemachine/cleanupDecline.js');
const BillController = global.SixCRM.routes.include('controllers', 'workers/statemachine/bill.js');
const ReportController = global.SixCRM.routes.include('controllers', 'workers/statemachine/report.js');
const SendDeliveryNotificationController = global.SixCRM.routes.include('controllers', 'workers/statemachine/sendDeliveryNotification.js');
const NotifyFulfillmentProvidersController = global.SixCRM.routes.include('controllers', 'workers/statemachine/notifyFulfillmentProviders.js');
const CreateRebillController = global.SixCRM.routes.include('controllers', 'workers/statemachine/createRebill.js');

const TriggerCreateRebillController = global.SixCRM.routes.include('controllers', 'workers/statemachine/triggers/triggerCreateRebill.js');
const TriggerTrackingController = global.SixCRM.routes.include('controllers', 'workers/statemachine/triggers/triggerTracking.js');
const TriggerPostFulfillmentController = global.SixCRM.routes.include('controllers', 'workers/statemachine/triggers/triggerPostFulfillment.js');
const TriggerFulfillmentController = global.SixCRM.routes.include('controllers', 'workers/statemachine/triggers/triggerFulfillment.js');
const TriggerPreFulfillmentController = global.SixCRM.routes.include('controllers', 'workers/statemachine/triggers/triggerPreFulfillment.js');
const TriggerRecoveryController = global.SixCRM.routes.include('controllers', 'workers/statemachine/triggers/triggerRecovery.js');

const DeactivateAccountController = global.SixCRM.routes.include('controllers', 'workers/statemachine/deactivateAccount.js');

module.exports = {
	gettrackinginformation: handleStepFunction((event) => new GetTrackingInformationController().execute(event)),
	senddeliverynotification: handleStepFunction((event) => new SendDeliveryNotificationController().execute(event)),
	gettrackingnumber: handleStepFunction((event) => new GetTrackingNumberController().execute(event)),
	notifyfulfillmentproviders: handleStepFunction((event) => new NotifyFulfillmentProvidersController().execute(event)),
	getfulfillmentrequired: handleStepFunction((event) => new GetFulfillmentRequiredController().execute(event)),
	cleanupdecline: handleStepFunction((event) => new CleanupDeclineController().execute(event)),
	getrecoverdate: handleStepFunction((event) => new GetRecoverDateController().execute(event)),
	bill: handleStepFunction((event) => new BillController().execute(event)),

	closesession: handleStepFunction((event) => new CloseSessionController().execute(event)),
	cleanupsession: handleStepFunction((event) => new CleanupSessionController().execute(event)),
	concludesession: handleStepFunction((event) => new ConcludeSessionController().execute(event)),
	getsessionstatus: handleStepFunction((event) => new GetSessionStatusController().execute(event)),
	getsessionclosed: handleStepFunction((event) => new GetSessionClosedController().execute(event)),
	getsessionrebill: handleStepFunction((event) => new GetSessionRebillController().execute(event)),
	getrebillsession: handleStepFunction((event) => new GetRebillSessionController().execute(event)),

	createrebill: handleStepFunction((event) => new CreateRebillController().execute(event)),
	report: handleStepFunction((event) => new ReportController().execute(event)),
	triggerpostfulfillment: handleStepFunction((event) => new TriggerPostFulfillmentController().execute(event)),
	triggerfulfillment: handleStepFunction((event) => new TriggerFulfillmentController().execute(event)),
	triggerprefulfillment: handleStepFunction((event) => new TriggerPreFulfillmentController().execute(event)),
	triggertracking: handleStepFunction((event) => new TriggerTrackingController().execute(event)),
	triggerrecovery: handleStepFunction((event) => new TriggerRecoveryController().execute(event)),
	triggercreaterebill: handleStepFunction((event) => new TriggerCreateRebillController().execute(event)),

	deactivateaccount: handleStepFunction((event) => new DeactivateAccountController().execute(event)),
};

function handleStepFunction(delegate) {
	return (event, context, callback) => new StepFunctionHandler().handle(event, context, callback, delegate);
}
