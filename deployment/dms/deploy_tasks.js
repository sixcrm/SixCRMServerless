require('../../SixCRM.js');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const DMSDeployment = global.SixCRM.routes.include('deployment', 'utilities/dms-deployment.js');
const dmsDeployment = new DMSDeployment();

dmsDeployment.deploy().then((result) => {
	return du.info(result);
}).catch(error => {
	du.error(error);
	du.warning(error.message);
});
