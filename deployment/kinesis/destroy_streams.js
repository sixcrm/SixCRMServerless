'use strict';
require('../../routes.js');
const du = global.routes.include('lib', 'debug-utilities.js');
const KinesisDeployment = global.routes.include('deployment', 'utilities/kinesis-deployment.js');

let stage = process.argv[2] || 'development';

du.highlight('Destroying Kinesis Streams');

let kinesisDeployment = new KinesisDeployment(stage);

return kinesisDeployment.destroyStreams().then((result) => {
  du.highlight(result);
}).catch(error => {
  du.error(error);
  du.warning(error.message);
});
