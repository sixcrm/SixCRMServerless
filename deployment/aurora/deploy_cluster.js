'use strict';
require('../../SixCRM.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const AuroraClusterDeployment = global.SixCRM.routes.include('deployment', 'utilities/aurora-cluster-deployment.js');

return AuroraClusterDeployment.deploy().then((result) => {
  return du.highlight(result);
}).catch(error => {
  du.error(error);
  du.warning(error.message);
});