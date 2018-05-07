require('../../SixCRM.js');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const AuroraClusterDeployment = global.SixCRM.routes.include('deployment', 'aurora/aurora-cluster-deployment.js');
const auroraClusterDeployment = new AuroraClusterDeployment();

auroraClusterDeployment.deploy().then((result) => {

	return du.info(result);

}).catch(error => {

	du.error(error);
	du.warning(error.message);

});
