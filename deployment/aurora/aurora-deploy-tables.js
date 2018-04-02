require('../../SixCRM.js');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const AuroraSchemaDeployment = global.SixCRM.routes.include('deployment', 'aurora/aurora-schema-deployment.js');
const auroraSchemaDeployment = new AuroraSchemaDeployment();

auroraSchemaDeployment.deployTables().then((result) => {

	return du.highlight(result);

}).catch(error => {

	du.error(error);
	du.warning(error.message);

});