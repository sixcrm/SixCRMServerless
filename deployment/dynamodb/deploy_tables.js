
require('@sixcrm/sixcrmcore');

const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const DynamoDBDeployment = global.SixCRM.routes.include('deployment', 'utilities/dynamodb-deployment.js');
const dynamoDBDeployment = new DynamoDBDeployment();

dynamoDBDeployment.deployTables().then((result) => {
	return du.info(result);
}).catch(error => {
	du.error(error);
	du.warning(error.message);
});
