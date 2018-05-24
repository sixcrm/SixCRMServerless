const StepFunctionHandler = require('./stepfunction-handler');

const GetTrackingInformationController = global.SixCRM.routes.include('controllers', 'workers/statemachine/getTrackingInformation.js');

module.exports = {
	gettrackinginformation: handleStepFunction((event) => new GetTrackingInformationController().execute(event))
};

function handleStepFunction(delegate) {
	return (event, context, callback) => new StepFunctionHandler().handle(event, context, callback, delegate);
}
