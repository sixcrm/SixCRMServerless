require('@6crm/sixcrmcore');

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const RedshiftSchemaDeployment = global.SixCRM.routes.include('deployment', 'utilities/redshift-schema-deployment.js');
const redshiftSchemaDeployment = new RedshiftSchemaDeployment();

redshiftSchemaDeployment.purge().then((result) => {
	return du.info(result);
}).catch(error => {
	du.error(error);
	du.warning(error.message);
});
