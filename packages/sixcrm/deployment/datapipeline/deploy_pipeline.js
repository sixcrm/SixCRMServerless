
require('@6crm/sixcrmcore');

const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;

const DataPipelineDeployment = global.SixCRM.routes.include('deployment', 'utilities/data-pipeline-deployment.js');
const dataPipelineDeployment = new DataPipelineDeployment();

dataPipelineDeployment.execute().then(result => {
	return du.info(result);
}).catch((error) => {
	du.error(error);
	du.warning(error.message);
});
