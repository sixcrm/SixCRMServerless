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
    if (key!=='bucket')
        Object.keys(s3Deployment.getConfig().buckets[bucket][key]).forEach((folder) => {
          bucket_parameters.Key=s3Deployment.getConfig().buckets[bucket][key][folder];
          s3Deployment.bucketExists(bucket_parameters).then(exists => {
              if (exists) {
                  du.warning('Bucket exists, testing for folder.');
                  console.log('Bucket exists, testing for folder.');
                  return s3Deployment.folderExists(bucket_parameters).then(exists => {
                    if (exists) {
                      du.warning('Folder exists, aborting.');
                      console.log('Folder exists, aborting.');
                    } else {
                      return s3Deployment.createFolderAndWait(bucket_parameters).then(response => {
                      du.output(response);
                        });
                    }
                  })
              } else {
                du.output('Stream does not exist, creating.');
                return s3Deployment.createBucketAndWait(bucket_parameters).then(response => {
                du.output(response);
                  });
              }
          }).then(() => { du.highlight('Complete')});

        });
  });
});
