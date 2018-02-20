'use strict';
require('../../SixCRM.js');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const IAMDeployment = global.SixCRM.routes.include('deployment', 'utilities/iam-deployment.js');

return IAMDeployment.deployUsers().then((result) => {
  return du.highlight(result);
}).catch(error => {
  du.error(error);
  du.warning(error.message);
});
