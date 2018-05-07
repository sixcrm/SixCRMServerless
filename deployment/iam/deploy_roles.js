require('../../SixCRM.js');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const IAMDeployment = global.SixCRM.routes.include('deployment', 'utilities/iam-deployment.js');
const iamDeployment = new IAMDeployment();

iamDeployment.deployRoles().then((result) => {
	return du.info(result);
}).catch(error => {
	du.error(error);
	du.warning(error.message);
});
