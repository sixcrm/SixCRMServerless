
require('@6crm/sixcrmcore');

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const S3Deployment = global.SixCRM.routes.include('deployment', 'utilities/s3-deployment.js');
const s3Deployment = new S3Deployment();

s3Deployment.destroyBuckets().then(result => {
	return du.info(result);
}).catch((error) => {
	du.error(error);
	du.warning(error.message);
});
