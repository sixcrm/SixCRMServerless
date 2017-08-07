'use strict';
require('../../SixCRM.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

const KinesisDeployment = global.SixCRM.routes.include('deployment', 'utilities/kinesis-deployment.js');
let kinesisDeployment = new KinesisDeployment();

return kinesisDeployment.destroyStreams().then((result) => {
  du.highlight(result);
}).catch(error => {
  du.error(error);
  du.warning(error.message);
});
