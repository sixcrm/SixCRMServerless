'use strict';
require('../../SixCRM.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const redshiftClusterDeployment = global.SixCRM.routes.include('deployment', 'utilities/redshift-cluster-deployment.js');

return redshiftClusterDeployment.destroy().then(result => {
  du.highlight(result);
}).catch((error) => {
  du.error(error);
  du.warning(error.message);
});
