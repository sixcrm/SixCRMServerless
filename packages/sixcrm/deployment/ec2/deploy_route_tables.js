require('@6crm/sixcrmcore');

const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const EC2Deployment = global.SixCRM.routes.include('deployment', 'utilities/ec2-deployment.js');

let ec2Deployment = new EC2Deployment();

ec2Deployment.deployRouteTables().then((result) => {
	return du.info(result);
}).catch(error => {
	du.error(error);
	du.warning(error.message);
});
