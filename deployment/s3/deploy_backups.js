
require('../../SixCRM.js');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

const S3Deployment = global.SixCRM.routes.include('deployment', 'utilities/s3-deployment.js');
const s3Deployment = new S3Deployment();

s3Deployment.configureBackups().then(result => {
  return du.highlight(result);
}).catch((error) => {
  du.error(error);
  du.warning(error.message);
});
