'use strict';
require('../../routes.js');
const du = global.routes.include('lib', 'debug-utilities.js');
const dynamodeploymentutilities = global.routes.include('deployment', 'utilities/dynamo-deploy-tables');
let environment = process.argv[2];

//Technical Debt:  Validate the environment variable
du.highlight('Purging DynamoDB Tables');
dynamodeploymentutilities.deleteAll(environment);
