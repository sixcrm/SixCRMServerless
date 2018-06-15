require('@sixcrm/sixcrmcore');

const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const APIGatewayDeployment = global.SixCRM.routes.include('deployment', 'utilities/apigateway-deployment.js');

let aPIGatewayDeployment = new APIGatewayDeployment();

aPIGatewayDeployment.deployCustomDomainName().then((result) => {
	return du.info(result);
}).catch(error => {
	du.error(error);
	du.warning(error.message);
});
