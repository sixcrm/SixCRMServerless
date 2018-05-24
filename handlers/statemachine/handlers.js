const StepFunctionHandler = require('./stepfunction-handler');

const GetTrackingInformationController = global.SixCRM.routes.include('controllers', 'workers/statemachine/getTrackingInformation.js');
const ArchiveController = global.SixCRM.routes.include('controllers', 'workers/statemachine/archive.js');

module.exports = {
	gettrackinginformation: handleStepFunction((event) => new GetTrackingInformationController().execute(event)),
	archive: handleStepFunction((event) => new ArchiveController().execute(event))
};

function handleStepFunction(delegate) {
	return (event, context, callback) => new StepFunctionHandler().handle(event, context, callback, delegate);
}
