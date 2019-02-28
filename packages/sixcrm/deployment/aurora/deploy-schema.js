require('@6crm/sixcrmcore');

const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const AuroraSchemaDeployment = global.SixCRM.routes.include('deployment', 'aurora/aurora-schema-deployment.js');
const auroraSchemaDeployment = new AuroraSchemaDeployment();
const configurationAcquistion = global.SixCRM.routes.include('config', 'controllers/configuration_acquisition.js');

process.env.aurora_host = configurationAcquistion.getAuroraClusterEndpoint();

auroraSchemaDeployment.deploy()
	.then(() => {

		return du.info('Aurora schema deployment complete.');

	}).catch(error => {

		du.error(error);
		throw error;

	});
