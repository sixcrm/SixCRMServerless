
require('@6crm/sixcrmcore');
const _ = require('lodash');
const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const DynamoDBAutoscalingDeployment = global.SixCRM.routes.include('deployment', 'utilities/dynamodb-autoscaling-deployment.js');
const dynamoDBAutoscalingDeployment = new DynamoDBAutoscalingDeployment();

let table = (!_.isUndefined(process.argv[2]))?process.argv[2]:null;

dynamoDBAutoscalingDeployment.autoscaleTables(table).then((result) => {
	return du.info(result);
}).catch(error => {
	du.error(error);
	du.warning(error.message);
});
