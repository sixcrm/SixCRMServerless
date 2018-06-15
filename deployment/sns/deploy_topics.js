
require('@sixcrm/sixcrmcore');

const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;

const SNSDeployment = global.SixCRM.routes.include('deployment', 'utilities/sns-deployment.js');
const snsDeployment = new SNSDeployment();

snsDeployment.createTopics().then(result => {
	return du.info(result);
}).catch((error) => {
	du.error(error);
	du.warning(error.message);
});
