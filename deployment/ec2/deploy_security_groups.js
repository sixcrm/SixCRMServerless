require('../../SixCRM.js');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const EC2Deployment = global.SixCRM.routes.include('deployment', 'utilities/ec2-deployment.js');

let ec2Deployment = new EC2Deployment();

ec2Deployment.deploySecurityGroups().then((result) => {
	return du.info(result);
}).catch(error => {
	du.error(error);
	du.warning(error.message);
});
