'use strict'
require('../../SixCRM.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const dynamo_deployment_utilities = global.SixCRM.routes.include('deployment', 'utilities/dynamo-deploy-tables.js');

du.highlight('Deploying DynamoDB Tables');
dynamo_deployment_utilities.deployAll();
