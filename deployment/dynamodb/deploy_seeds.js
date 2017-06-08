'use strict'
require('../../routes.js');
const du = global.routes.include('lib', 'debug-utilities.js');
const dynamo_deployment_utilities = global.routes.include('deployment', 'utilities/dynamo-deploy-seeds.js');

let environment = process.argv[2] || 'development';
let region = process.argv[3] || process.env.AWS_REGION || 'us-east-1';

du.highlight('Deploying DynamoDB Seeds');
dynamo_deployment_utilities.deployAllSeeds(environment, region);
