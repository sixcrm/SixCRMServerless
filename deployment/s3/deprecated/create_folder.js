'use strict';
require('../../SixCRM.js');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const stringUtilities = global.SixCRM.routes.include('deployment', 'utilities/string-utilities.js');
const S3Deployment = global.SixCRM.routes.include('deployment', 'utilities/s3-deployment.js');

let environment = process.argv[2] || 'development';

du.highlight('Creating S3 Bucket');

let s3Deployment = new S3Deployment(environment);

/* Epic */
let bucket_list = Object.keys(s3Deployment.getConfig().buckets);

bucket_list.map(bucket => {
  let bucket_parameters = {
    Bucket: s3Deployment.getConfig().buckets[bucket].bucket,
    Key: '',
    Body: s3Deployment.getConfig().buckets[bucket].bucket
  }

  Object.keys(s3Deployment.getConfig().buckets[bucket]).forEach((key) => {
    if (key !== 'bucket')
      Object.keys(s3Deployment.getConfig().buckets[bucket][key]).forEach((folder) => {
        bucket_parameters.Key = s3Deployment.getConfig().buckets[bucket][key][folder];
        s3Deployment.folderExists(bucket_parameters).then(exists => {
          if (exists) {
            du.warning('Folder exists, Aborting.');
          } else {
            du.warning('Folder does not exists, creating.');
            return s3Deployment.createFolderAndWait(bucket_parameters).then(response => {
              du.output(response);
            });
          }
        }).then(() => {
          du.highlight('Complete')
        });
      })
  });
});
