
require('../../SixCRM.js');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const DynamoDBAutoscalingDeployment = global.SixCRM.routes.include('deployment', 'utilities/dynamodb-autoscaling-deployment.js');
const dynamoDBAutoscalingDeployment = new DynamoDBAutoscalingDeployment();

dynamoDBAutoscalingDeployment.autoscaleTables().then((result) => {
	return du.info(result);
}).catch(error => {
	du.error(error);
	du.warning(error.message);
});
