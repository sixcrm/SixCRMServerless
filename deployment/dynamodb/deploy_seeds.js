'use strict'
require('../../routes.js');
const dynamo_deployment_utilities = global.routes.include('deployment', 'utilities/dynamo-deploy-seeds.js');

let stage = process.argv[2] || 'development';

dynamo_deployment_utilities.deployAllSeeds(stage);
