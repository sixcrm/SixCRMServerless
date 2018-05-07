require('../../SixCRM.js');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const ElasticacheDeployment = global.SixCRM.routes.include('deployment', 'utilities/elasticache-deployment.js');

let elasticacheDeployment = new ElasticacheDeployment();

elasticacheDeployment.deploySubnetGroups().then((result) => {
	return du.info(result);
}).catch(error => {
	du.error(error);
	du.warning(error.message);
});
