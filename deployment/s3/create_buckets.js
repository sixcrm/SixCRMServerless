'use strict';
require('../../routes.js');

const du = global.routes.include('lib', 'debug-utilities.js');
const stringUtilities = global.routes.include('deployment', 'utilities/string-utilities.js');
const S3Deployment = global.routes.include('deployment', 'utilities/s3-deployment.js');

let environment = process.argv[2] || 'development';

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
                du.warning('Bucket exists, Aborting');
            } else {
                du.output('Bucket does not exist, creating.');
                return s3Deployment.createBucketAndWait(bucket_parameters).then(response => {
                  du.output(response);
                });
            }
        }).then(() => { du.highlight('Complete')})
  });
});
