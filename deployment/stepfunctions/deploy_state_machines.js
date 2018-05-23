
require('../../SixCRM.js');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const StepFunctionDeployment = global.SixCRM.routes.include('deployment', 'utilities/stepfunction-deployment.js');
const stepFunctionDeployment = new StepFunctionDeployment();

stepFunctionDeployment.deployStateMachines().then(result => {
	return du.info(result);
}).catch((error) => {
	du.error(error);
	du.warning(error.message);
});
