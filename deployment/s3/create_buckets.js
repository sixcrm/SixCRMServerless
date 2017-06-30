'use strict';
require('../../routes.js');

const fs = require('fs');

const du = global.routes.include('lib', 'debug-utilities.js');
const stringUtilities = global.routes.include('deployment', 'utilities/string-utilities.js');
const S3sDeployment = global.routes.include('deployment', 'utilities/s3-deployment.js');

const AWS = require("aws-sdk");
var s3 = new AWS.S3({apiVersion: '2006-03-01',  region: 'us-east-1'});

let environment = process.argv[2] || 'development';
let region = process.argv[3] || process.env.AWS_REGION || 'us-east-1';

du.highlight('Creating S3 Bucket');

let s3Deployment = new S3Deployment(environment);

s3Deployment.createBucketAndWait(stream_parameters.DeliveryStreamName).then(exists => {
    if (exists) {
        du.warning('Bucket exists, aborting.');
        return Promise.resolve();
    } else {
        du.output('Bucket does not exist, creating.');
        return s3Deployment.createBucket(stream_parameters).then(response => {
        du.output(response);
        });
    }
}).then(() => { du.highlight('Complete')});
