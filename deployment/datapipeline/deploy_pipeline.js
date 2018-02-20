'use strict';
require('../../SixCRM.js');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

const DataPipelineDeployment = global.SixCRM.routes.include('deployment', 'utilities/data-pipeline-deployment.js');

DataPipelineDeployment.execute().then(result => {
  return du.highlight(result);
}).catch((error) => {
  du.error(error);
  du.warning(error.message);
});
