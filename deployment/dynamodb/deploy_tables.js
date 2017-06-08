'use strict'
require('../../routes.js');
const du = global.routes.include('lib', 'debug-utilities.js');
const dynamo_deployment_utilities = global.routes.include('deployment', 'utilities/dynamo-deploy-tables.js');

let environment = process.argv[2] || 'development';
let region = process.argv[3] || process.env.AWS_REGION || 'us-east-1';

//Technical Debt:  Validate input parameters...

du.highlight('Deploying DynamoDB Tables');
dynamo_deployment_utilities.deployAll(environment, region);
