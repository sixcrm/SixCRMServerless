require('../../SixCRM.js');
const _ = require('lodash');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const DynamoDBDeployment = global.SixCRM.routes.include('deployment', 'utilities/dynamodb-deployment.js');
const dynamoDBDeployment = new DynamoDBDeployment();

let table = (!_.isUndefined(process.argv[2]))?process.argv[2]:null;

dynamoDBDeployment.seedTables(false, table).then((result) => {
	return du.info(result);
}).catch(error => {
	du.error(error);
	du.warning(error.message);
});
