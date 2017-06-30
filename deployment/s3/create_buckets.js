'use strict';
require('../../routes.js');

const fs = require('fs');

const du = global.routes.include('lib', 'debug-utilities.js');
const stringUtilities = global.routes.include('deployment', 'utilities/string-utilities.js');
const KinesisDeployment = global.routes.include('deployment', 'utilities/s3-deployment.js');

const AWS = require("aws-sdk");
var s3 = new AWS.S3({apiVersion: '2006-03-01',  region: 'us-east-1'});

let environment = process.argv[2] || 'development';
let region = process.argv[3] || process.env.AWS_REGION || 'us-east-1';

du.highlight('Creating S3 Bucket');

let s3Deployment = new S3Deployment(environment);
