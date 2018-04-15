require('../../SixCRM.js');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const EC2Deployment = global.SixCRM.routes.include('deployment', 'utilities/ec2-deployment.js');

let ec2Deployment = new EC2Deployment();

ec2Deployment.deployVPCs()
	.then(() => ec2Deployment.deploySecurityGroups())
	.then(() => ec2Deployment.deploySubnets())
	.then(() => ec2Deployment.deployEIPs())
	.then(() => ec2Deployment.deployNATs())
	.then(() => ec2Deployment.deployInternetGateways())
	.then(() => ec2Deployment.deployRouteTables())
	.then(() => {
		du.highlight('Environment Deployed');
		return true;
	}).catch(error => {
		du.error(error);
		du.warning(error.message);
	});
