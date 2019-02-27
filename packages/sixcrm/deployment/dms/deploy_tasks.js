require('@6crm/sixcrmcore');

const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const DMSDeployment = global.SixCRM.routes.include('deployment', 'utilities/dms-deployment.js');
const dmsDeployment = new DMSDeployment();

dmsDeployment.deploy().then((result) => {
	return du.info(result);
}).catch(error => {
	du.error(error);
	du.warning(error.message);
});
