'use strict';
require('../../SixCRM.js');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const redshiftDeployment = global.SixCRM.routes.include('deployment', 'utilities/redshift-deployment.js');

return redshiftDeployment.seedTables().then((result) => {
  du.highlight(result);
}).catch(error => {
  du.error(error);
  du.warning(error.message);
});
