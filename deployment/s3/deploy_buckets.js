'use strict';
require('../../routes.js');

const du = global.routes.include('lib', 'debug-utilities.js');
const S3Deployment = global.routes.include('deployment', 'utilities/s3-deployment.js');

let stage = process.argv[2] || 'development';

du.highlight('Destroying S3 Directories');

let s3Deployment = new S3Deployment(stage);

s3Deployment.createBuckets().then(result => {
  du.highlight(result);
}).catch((error) => {
  du.error(error);
  du.warning(error.message);
});
