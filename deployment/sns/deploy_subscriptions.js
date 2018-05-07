
require('../../SixCRM.js');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

const SNSDeployment = global.SixCRM.routes.include('deployment', 'utilities/sns-deployment.js');
const snsDeployment = new SNSDeployment();

snsDeployment.addSubscriptions().then(result => {
	return du.info(result);
}).catch((error) => {
	du.error(error);
	du.warning(error.message);
});
