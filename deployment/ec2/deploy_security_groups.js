'use strict';
require('../../SixCRM.js');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const EC2Deployment = global.SixCRM.routes.include('deployment', 'utilities/ec2-deployment.js');

let stage = process.argv[2] || 'development';
let ec2Deployment = new EC2Deployment(stage);

return ec2Deployment.deploySecurityGroups().then((result) => {
  du.highlight(result);
}).catch(error => {
  du.error(error);
  du.warning(error.message);
});
