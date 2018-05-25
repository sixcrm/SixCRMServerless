require('../../SixCRM.js');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const CloudwatchDeployment = global.SixCRM.routes.include('deployment', 'utilities/cloudwatch-deployment.js');

let cloudwatch_deployment = new CloudwatchDeployment();

cloudwatch_deployment.deployLoggerPermissions()
	.then(() => cloudwatch_deployment.deploySubscriptionFilters())
	.then((result) => {
		return du.info(result);
	}).catch(error => {
		du.error(error);
		process.exit(-1);
	});
