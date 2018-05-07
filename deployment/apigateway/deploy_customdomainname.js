require('../../SixCRM.js');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const APIGatewayDeployment = global.SixCRM.routes.include('deployment', 'utilities/apigateway-deployment.js');

let aPIGatewayDeployment = new APIGatewayDeployment();

aPIGatewayDeployment.deployCustomDomainName().then((result) => {
	return du.info(result);
}).catch(error => {
	du.error(error);
	du.warning(error.message);
});
