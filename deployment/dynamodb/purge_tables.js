'use strict';
const du = require('../../lib/debug-utilities.js');
const dynamodeploymentutilities = require('../utilities/dynamo-deploy');
let environment = process.argv[2];

//Technical Debt:  Validate the environment variable
du.highlight('Purging DynamoDB Tables');
dynamodeploymentutilities.deleteAll(environment);
