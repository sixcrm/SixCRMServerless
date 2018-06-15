
require('@sixcrm/sixcrmcore');

const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const ElasticacheDeployment = global.SixCRM.routes.include('deployment', 'utilities/elasticache-deployment.js');

let stage = process.argv[2] || 'development';
let elasticacheDeployment = new ElasticacheDeployment(stage);

elasticacheDeployment.destroy().then((result) => {
	return du.info(result);
}).catch(error => {
	du.error(error);
	du.warning(error.message);
});
