'use strict';
require('../../routes.js');

const fs = require('fs');

const du = global.routes.include('lib', 'debug-utilities.js');
const stringUtilities = global.routes.include('deployment', 'utilities/string-utilities.js');
const AWS = require("aws-sdk");
const S3Deployment = global.routes.include('deployment', 'utilities/s3-deployment.js');

let environment = process.argv[2] || 'development';
let region = process.argv[3] || process.env.AWS_REGION || 'us-east-1';

du.highlight('Creating S3 Bucket');

let s3Deployment = new S3Deployment(environment);

/* Epic */
let bucket_list = Object.keys(s3Deployment.getConfig().buckets);

bucket_list.map(bucket => {
  let bucket_parameters = {Bucket: s3Deployment.getConfig().buckets[bucket].bucket,Key:'',Body: s3Deployment.getConfig().buckets[bucket].bucket}

  Object.keys(s3Deployment.getConfig().buckets[bucket]).forEach((key) => {
    if (key=='bucket')
        s3Deployment.bucketExists(bucket_parameters).then(exists => {
            if (exists) {
                du.warning('Bucket exists, destroying');
                console.log('Bucket exists, destroying');
                return s3Deployment.deleteBucketAndWait(bucket_parameters).then(response => {
                  du.output(response);
                });
            } else {
                du.output('Bucket does not exist, Aborting.');
                console.log('Bucket does not exist, Aborting.');
            }
        }).then(() => { du.highlight('Complete')})
  });
});
