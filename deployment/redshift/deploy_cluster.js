require('../../SixCRM.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const RedshiftClusterDeployment = global.SixCRM.routes.include('deployment', 'utilities/redshift-cluster-deployment.js');
const redshiftClusterDeployment = new RedshiftClusterDeployment();

redshiftClusterDeployment.deploy().then((result) => {
	return du.highlight(result);
}).catch(error => {
	du.error(error);
	du.warning(error.message);
});
