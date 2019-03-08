require('@6crm/sixcrmcore');

const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const AuroraSchemaDeployment = global.SixCRM.routes.include('deployment', 'aurora/aurora-schema-deployment.js');
const auroraSchemaDeployment = new AuroraSchemaDeployment();

auroraSchemaDeployment.deploy()
	.then(() => {

		return du.info('Aurora schema deployment complete.');

	}).catch(error => {

		du.error(error);
		throw error;

	});
