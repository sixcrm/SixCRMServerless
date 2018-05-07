require('../../SixCRM.js');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const CloudsearchDeployment = global.SixCRM.routes.include('deployment', 'utilities/cloudsearch-deployment.js');
const cloudsearchDeployment = new CloudsearchDeployment();

cloudsearchDeployment.purge().then((result) => {
	return du.info(result);
}).catch(error => {
	du.error(error);
	du.warning(error.message);
});
