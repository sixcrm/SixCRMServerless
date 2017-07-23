'use strict';
require('../../SixCRM.js');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const stringUtilities = global.SixCRM.routes.include('deployment', 'utilities/string-utilities.js');
const KinesisDeployment = global.SixCRM.routes.include('deployment', 'utilities/kinesis-deployment.js');

let environment = process.argv[2] || 'development';

du.highlight('Destroying Kinesis Stream');

let kinesisDeployment = new KinesisDeployment(environment);

/* Set the list of relevant streams*/

let stream_list = Object.keys(kinesisDeployment.getConfig().streams).filter(name => name.match(/\_stream$/));

stream_list.map( stream =>  {

  let stream_parameters = {
    DeliveryStreamName: kinesisDeployment.getConfig().streams[stream].DeliveryStreamName
  };

  du.output('Stream parameters are:', stream_parameters);

  kinesisDeployment.streamExists(stream_parameters.DeliveryStreamName).then(exists => {
      if (exists) {
        du.output('Stream exist, destroying.');
        return kinesisDeployment.deleteStreamAndWait(stream_parameters).then(response => {
            du.output(response);
        });
      } else {
        du.warning('Stream does not exists, aborting.');
        return Promise.resolve();
      }
  }).then(() => { du.highlight('Complete')});
}
);
