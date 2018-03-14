'use strict';
require('../../SixCRM.js');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const auroraSchemaDeployment = global.SixCRM.routes.include('deployment', 'utilities/aurora-schema-deployment.js');

return auroraSchemaDeployment.deployTables().then((result) => {
  return du.highlight(result);
}).catch(error => {
  du.error(error);
  du.warning(error.message);
});
