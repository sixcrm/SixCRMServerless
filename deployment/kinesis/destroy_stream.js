'use strict';
require('../../routes.js');

const fs = require('fs');

const du = global.routes.include('lib', 'debug-utilities.js');
const stringUtilities = global.routes.include('deployment', 'utilities/string-utilities.js');
const KinesisDeployment = global.routes.include('deployment', 'utilities/kinesis-deployment.js');

const AWS = require("aws-sdk");
var firehose = new AWS.Firehose({apiVersion: '2015-08-04',  region: 'us-east-1'});

let environment = process.argv[2] || 'development';
let region = process.argv[3] || process.env.AWS_REGION || 'us-east-1';

du.highlight('Destroying Kinesis Stream');

let kinesisDeployment = new KinesisDeployment(environment);

/* Set the list of relevant streams*/

let stream_list = Object.keys(kinesisDeployment.getConfig().streams).filter(name => name.match(/\_stream$/));

stream_list.map( stream =>  {

  let stream_parameters = {
    StreamName: kinesisDeployment.getConfig().streams[stream].DeliveryStreamName
  };
  du.output('Stream parameters are:', stream_parameters);

  kinesisDeployment.streamExists(stream_parameters.StreamName).then(exists => {
      if (exists) {
          du.warning('Stream exists, aborting.');
          return Promise.resolve();
      } else {
          du.output('Stream does not exist, creating.');
          return kinesisDeployment.deleteStreamAndWait(stream_parameters).then(response => {
              du.output(response);
          });
      }
  }).then(() => { du.highlight('Complete')});
}
);
