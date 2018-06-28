require('@6crm/sixcrmcore');

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;

const CloudwatchDeployment = global.SixCRM.routes.include('deployment', 'utilities/cloudwatch-deployment.js');

let cloudwatch_deployment = new CloudwatchDeployment();

cloudwatch_deployment.deployLoggerPermissions()
	.then(() => cloudwatch_deployment.deploySubscriptionFilters())
	.then(() => {	return du.info("Complete");	})
	.catch(error => {
		du.error(error);
		process.exit(-1);
	});
