'use strict';
require('../../routes.js');

const du = global.routes.include('lib', 'debug-utilities.js');
const ElasticacheDeployment = global.routes.include('deployment', 'utilities/elasticache-deployment.js');

let stage = process.argv[2] || 'development';
let elasticacheDeployment = new ElasticacheDeployment(stage);

return elasticacheDeployment.purge().then((result) => {
  du.highlight(result);
}).catch(error => {
  du.error(error);
  du.warning(error.message);
});
