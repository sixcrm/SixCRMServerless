
require('@6crm/sixcrmcore');

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const SQSDeployment = global.SixCRM.routes.include('deployment', 'utilities/sqs-deployment.js');
const sqsDeployment = new SQSDeployment();

sqsDeployment.destroyQueues().then(result => {
	return du.info(result);
}).catch((error) => {
	du.error(error);
	du.warning(error.message);
});
