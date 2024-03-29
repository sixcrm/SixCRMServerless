require('@6crm/sixcrmcore');

const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const AuroraClusterDeployment = global.SixCRM.routes.include('deployment', 'utilities/rds-utilities.js');
const auroraClusterDeployment = new AuroraClusterDeployment();

auroraClusterDeployment.deploySubnetGroups().then((result) => {

	return du.info(result);

}).catch(error => {

	du.error(error);
	du.warning(error.message);

});
