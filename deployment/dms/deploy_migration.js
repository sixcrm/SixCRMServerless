'use strict';
require('../../SixCRM.js');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

const DMSDeployment = global.SixCRM.routes.include('deployment', 'utilities/dms-deployment.js');

DMSDeployment.executeMigration().then(result => {
  du.highlight(result);
}).catch((error) => {
  du.error(error);
  du.warning(error.message);
});
