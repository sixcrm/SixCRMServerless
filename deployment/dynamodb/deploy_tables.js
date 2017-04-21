'use strict'
const du = require('../../lib/debug-utilities.js');
const dynamoDeployUtil = require('../utilities/dynamo-deploy');
let environment = process.argv[2] || 'development';
let region = process.argv[3] || process.env.AWS_REGION || 'us-east-1';

du.highlight('Deploying DynamoDB Tables');
dynamoDeployUtil.deployAll(environment, region);

