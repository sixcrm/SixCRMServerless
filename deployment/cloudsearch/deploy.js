'use strict'
require('../../SixCRM.js');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const cloudsearchDeployment = global.SixCRM.routes.include('deployment', 'utilities/cloudsearch-deployment.js');

return cloudsearchDeployment.deploy().then((result) => {
  du.highlight(result);
}).catch(error => {
  du.error(error);
  du.warning(error.message);
});
