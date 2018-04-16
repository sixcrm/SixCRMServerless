require('../../SixCRM.js');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const ElasticSearchDeployment = global.SixCRM.routes.include('deployment', 'utilities/elasticsearch-deployment.js');

let elasticsearch_deployment = new ElasticSearchDeployment();

elasticsearch_deployment.deployDomains().then((result) => {
	return du.highlight(result);
}).catch(error => {
	du.error(error);
	du.warning(error.message);
});
