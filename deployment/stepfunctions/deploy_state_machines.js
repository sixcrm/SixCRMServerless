
require('@6crm/sixcrmcore');

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const StepFunctionDeployment = global.SixCRM.routes.include('deployment', 'utilities/stepfunction-deployment.js');
const stepFunctionDeployment = new StepFunctionDeployment();

stepFunctionDeployment.deployStateMachines().then(result => {
	return du.info(result);
}).catch((error) => {
	du.error(error);
	du.warning(error.message);
});
