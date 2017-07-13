'use strict'
require('../../routes.js');

const du = global.routes.include('lib', 'debug-utilities.js');
const configurationutilities = global.routes.include('lib', 'configuration-utilities.js');

const dynamo_deployment_utilities = global.routes.include('deployment', 'utilities/dynamo-deploy-tables.js');

du.highlight('Deploying DynamoDB Tables');
let stage = configurationutilities.resolveStage(process.argv[2]);

dynamo_deployment_utilities.deployAll(stage);
