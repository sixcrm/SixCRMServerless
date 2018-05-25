require('../../SixCRM.js');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const CloudwatchDeployment = global.SixCRM.routes.include('deployment', 'utilities/cloudwatch-deployment.js');

let cloudwatch_deployment = new CloudwatchDeployment();

du.info("AWS region", global.SixCRM.configuration.site_config.aws.region);
du.info("Environment", process.env);

cloudwatch_deployment.deployLoggerPermissions()
	.then(() => cloudwatch_deployment.deploySubscriptionFilters())
	.then((result) => {
		return du.info(result);
	}).catch(error => {
		du.error(error);
		process.exit(-1);
	});
