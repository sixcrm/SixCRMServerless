'use strict';
require('../../routes.js');
const du = global.routes.include('lib', 'debug-utilities.js');
const KinesisDeployment = global.routes.include('deployment', 'utilities/kinesis-deployment.js');

let stage = process.argv[2] || 'development';
let config_path ='kinesis/config'

du.highlight('Creating Kinesis Stream');

let kinesisDeployment = new KinesisDeployment(stage,config_path);

return kinesisDeployment.deployStreams().then((result) => {
  du.highlight(result);
}).catch(error => {
  du.error(error);
  du.warning(error.message);
});
