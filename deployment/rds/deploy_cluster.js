'use strict';
require('../../SixCRM.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const RDSClusterDeployment = global.SixCRM.routes.include('deployment', 'utilities/rds-cluster-deployment.js');

return RDSClusterDeployment.deploy().then((result) => {
  return du.highlight(result);
}).catch(error => {
  du.error(error);
  du.warning(error.message);
});
