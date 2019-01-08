
require('@6crm/sixcrmcore');

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;

const SNSDeployment = global.SixCRM.routes.include('deployment', 'utilities/sns-deployment.js');
const snsDeployment = new SNSDeployment();

snsDeployment.addSubscriptions().then(result => {
	return du.info(result);
}).catch((error) => {
	du.error(error);
	du.warning(error.message);
});
