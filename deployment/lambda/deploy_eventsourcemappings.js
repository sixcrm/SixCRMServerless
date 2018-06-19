
require('@sixcrm/sixcrmcore');

const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;

const LambdaDeployment = global.SixCRM.routes.include('deployment', 'utilities/lambda-deployment.js');

new LambdaDeployment().deployEventSourceMappings().then(result => {
	return du.info(result);
}).catch((error) => {
	du.error(error);
	du.warning(error.message);
});