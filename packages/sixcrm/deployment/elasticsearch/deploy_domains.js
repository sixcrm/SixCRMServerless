require('@6crm/sixcrmcore');

const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const ElasticSearchDeployment = global.SixCRM.routes.include('deployment', 'utilities/elasticsearch-deployment.js');

let elasticsearch_deployment = new ElasticSearchDeployment();

elasticsearch_deployment.deployDomains().then((result) => {
	du.info(result);
	return elasticsearch_deployment.deployIndices().then((result) => {
		return du.info(result);
	});
}).catch(error => {
	du.error(error);
	du.warning(error.message);
});
