'use strict';
require('../../routes.js');

const du = global.routes.include('lib', 'debug-utilities.js');
const stringUtilities = global.routes.include('deployment', 'utilities/string-utilities.js');
const KinesisDeployment = global.routes.include('deployment', 'utilities/kinesis-deployment.js');

const AWS = require("aws-sdk");

let environment = process.argv[2] || 'development';

let region = process.argv[3] || process.env.AWS_REGION || 'us-east-1';

du.highlight('Creating Kinesis Stream');

let kinesisDeployment = new KinesisDeployment(environment);

/* Set the list of relevant streams*/

let stream_list = Object.keys(kinesisDeployment.getConfig().streams).filter(name => name.match(/\_stream$/));

/*var params = {
  DeliveryStreamName: 'Test',
  RedshiftDestinationConfiguration: {
    ClusterJDBCURL: 'jdbc:redshift://sixcrm-test.ch9ptr45aofu.us-east-1.redshift.amazonaws.com:5439/dev',
    CopyCommand: {
      DataTableName: 'f_transactions',
      CopyOptions: "json 'auto' timeformat 'YYYY-MM-DDTHH:MI:SS'",
    },
    Password: 'Jagodica9',
    RoleARN: 'arn:aws:iam::068070110666:role/firehose_delivery_role',
    S3Configuration: {
      BucketARN: 'arn:aws:s3:::sixcrm-development-redshift',
      RoleARN: 'arn:aws:iam::068070110666:role/firehose_delivery_role',
      BufferingHints: {
        IntervalInSeconds: 60,
        SizeInMBs: 1
      },
      CompressionFormat: 'UNCOMPRESSED' ,
      Prefix: 'sixcrm-kinesis-transactions/'
    },
    Username: 'admin',
    RetryOptions: {
      DurationInSeconds: 1
    },
    S3BackupMode: 'Disabled'
  }
}; */

var firehose = new AWS.Firehose({apiVersion: '2015-08-04',  region: 'us-east-1'});
/*firehose.createDeliveryStream(params, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data);           // successful response
});*/
