'use strict';
require('../../SixCRM.js');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const stringUtilities = global.SixCRM.routes.include('deployment', 'utilities/string-utilities.js');
const KinesisDeployment = global.SixCRM.routes.include('deployment', 'utilities/kinesis-deployment.js');

let environment = process.argv[2] || 'development';

du.highlight('Creating Kinesis Stream');

let kinesisDeployment = new KinesisDeployment(environment);

/* Set the list of relevant streams*/

let stream_list = Object.keys(kinesisDeployment.getConfig().streams).filter(name => name.match(/\_stream$/));

stream_list.map(stream => {

  let stream_parameters = {};

  Object.keys(kinesisDeployment.getConfig().streams[stream]).forEach((key) => {
    let key_name = stringUtilities.toPascalCase(key);

    stream_parameters[key_name] = kinesisDeployment.getConfig().streams[stream][key];

    if (stream_parameters[key_name].S3Configuration !== undefined)
      stream_parameters[key_name].S3Configuration.RoleARN = 'arn:aws:iam::' + kinesisDeployment.aws_config.account + ':role/' + stream_parameters[key_name].S3Configuration.RoleARN;

    if (stream_parameters[key_name].RoleARN !== undefined)
      stream_parameters[key_name].RoleARN = 'arn:aws:iam::' + kinesisDeployment.aws_config.account + ':role/' + stream_parameters[key_name].RoleARN;
  });

  kinesisDeployment.streamExists(stream_parameters.DeliveryStreamName).then(exists => {
    if (exists) {
      du.warning('Stream exists, aborting.');
      return Promise.resolve();
    } else {
      du.output('Stream does not exist, creating.');
      return kinesisDeployment.createStreamAndWait(stream_parameters).then(response => {
        du.output(response);
      });
    }
  }).then(() => {
    du.highlight('Complete')
  });
});
