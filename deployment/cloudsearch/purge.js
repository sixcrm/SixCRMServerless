'use strict'
require('../../routes.js');

const du = global.routes.include('lib', 'debug-utilities.js');
const CloudsearchDeployment = global.routes.include('deployment', 'utilities/cloudsearch-deployment.js');

let stage = process.argv[2] || 'development';

process.env.stage = stage;

let cloudsearchDeployment = new CloudsearchDeployment(stage);

return cloudsearchDeployment.purge().then((result) => {
  du.highlight(result);
}).catch(error => {
  du.error(error);
  du.warning(error.message);
});
