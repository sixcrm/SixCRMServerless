'use strict';
require('../../routes.js');

const du = global.routes.include('lib', 'debug-utilities.js');
const RedshiftDeployment = global.routes.include('deployment', 'utilities/redshift-deployment.js');

let stage = process.argv[2] || 'development';

du.highlight('Destroying Redshift Cluster');

let redshiftDeployment = new RedshiftDeployment(stage);

return redshiftDeployment.destroyCluster().then(result => {
  du.highlight(result);
}).catch((error) => {
  du.error(error);
  du.warning(error.message);
});
