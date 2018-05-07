require('../../SixCRM.js');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const ElasticacheDeployment = global.SixCRM.routes.include('deployment', 'utilities/elasticache-deployment.js');

let stage = process.argv[2] || 'development';
let elasticacheDeployment = new ElasticacheDeployment(stage);

elasticacheDeployment.purge().then((result) => {
	return du.info(result);
}).catch(error => {
	du.error(error);
	du.warning(error.message);
});
