require('@6crm/sixcrmcore');

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const IAMDeployment = global.SixCRM.routes.include('deployment', 'utilities/iam-deployment.js');
const iamDeployment = new IAMDeployment();

iamDeployment.destroyUsers().then((result) => {
	return du.info(result);
}).catch(error => {
	du.error(error);
	du.warning(error.message);
});
