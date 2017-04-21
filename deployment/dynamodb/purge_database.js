'use strict';
const du = require('../../lib/debug-utilities.js');
const dynamoDeployUtil = require('../utilities/dynamo-deploy');
let environment = process.argv[2];

du.highlight('Purging DynamoDB Tables');
dynamoDeployUtil.deleteAll(environment);

