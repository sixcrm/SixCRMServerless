require('@sixcrm/sixcrmcore');

const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const ElasticacheDeployment = global.SixCRM.routes.include('deployment', 'utilities/elasticache-deployment.js');

let elasticacheDeployment = new ElasticacheDeployment();

elasticacheDeployment.deploySubnetGroups().then((result) => {
	return du.info(result);
}).catch(error => {
	du.error(error);
	du.warning(error.message);
});
