'use strict';
//Technical Debt:  Use a Kinesis Utilities class for AWS Calls
const AWS = require("aws-sdk");

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const AWSDeploymentUtilities = global.SixCRM.routes.include('deployment', 'utilities/aws-deployment-utilities.js');

module.exports = class KinesisDeployment extends AWSDeploymentUtilities {

  constructor() {

    // JSON of all the streams config
    // Technical debt, need to move HOST info out of JSON
    super();

    this.firehosetutilities = global.SixCRM.routes.include('lib', 'firehose-utilities.js');

    //Note:  This does not belong here.
    this.kinesis = new AWS.Firehose({
      region: global.SixCRM.configuration.site_config.aws.region,
      apiVersion: '2015-08-04',
    });

  }

  getEntityConfig(config_path) {

    du.debug('Get Config of Entity');

    let config = global.SixCRM.routes.include('deployment', config_path + '/config.json');

    if (!config) {
      eu.throwError('server', 'Configuration.getEntityConfig was unable to identify file ' + global.SixCRM.routes.path('deployment', config_path + '/config.json'));
    }

    return config;

  }

  destroyStreams() {

    // Get a list of streams from JSON and execute destruction

    let stream_list = this.getStreamList();

    let destroy_promises = arrayutilities.map(stream_list, (stream) => {

      let stream_parameters = {
        DeliveryStreamName: global.SixCRM.configuration.site_config.kinesis.firehose.streams[stream].DeliveryStreamName
      };

      du.output('Attempting to destroy "' + stream_parameters.DeliveryStreamName + '"');

      return this.streamExists(stream_parameters.DeliveryStreamName).then(exists => {

        if (exists) {

          du.output('Stream exists,  destroying...');

          return this.deleteStreamAndWait(stream_parameters).then(response => {

            return response;

          });

        } else {

          du.warning('Stream does not exist.');

          return Promise.resolve();

        }

      });

    });

    return arrayutilities.serial(
      destroy_promises
    ).then(() => {
      return 'Complete';
    });


  }

  getStreamList() {

    return objectutilities.getKeys(global.SixCRM.configuration.site_config.kinesis.firehose.streams).filter(name => name.match(/\_stream$/));

  }

  deployStreams() {

    // Get a list of streams from JSON and execute creation

    let stream_list = this.getStreamList();

    let deployment_promises = arrayutilities.map(stream_list, (stream) => {

        du.output('Attempting to create "' + global.SixCRM.configuration.site_config.kinesis.firehose.streams[stream].DeliveryStreamName + '"');

        return global.SixCRM.configuration.getEnvironmentConfig('redshift.host').then((host) => {

          let stream_parameters = this.streamParameters(stream, host);

          this.streamExists(stream_parameters.DeliveryStreamName).then(exists => {

            if (exists) {

              du.warning('Stream exists.');

              return Promise.resolve();

            } else {

              du.output('Stream does not exist, creating.');

              return this.createStreamAndWait(stream_parameters).then(response => {

                du.output('AWS Response: ' + response);

                return true;

              });

            }

          }).then(() => {

            du.highlight('Stream created.');

          }).catch(error => {

            du.error(error);

          });

        })
      });

    return arrayutilities.serial(
      deployment_promises
    ).then(() => {
      return 'Complete';
    });


  }

  streamParameters(stream, host) {

    // Tehnical debt, need to change this when conif.json comes into play
    let stream_parameters = {};

    objectutilities.getKeys(global.SixCRM.configuration.site_config.kinesis.firehose.streams[stream]).forEach((key) => {

      if (key == 'RedshiftDestinationConfiguration') {

        // Need to get general security solution

        stream_parameters[key] = global.SixCRM.configuration.site_config.kinesis.firehose.streams[stream][key];
        stream_parameters[key].ClusterJDBCURL = 'jdbc:redshift://' + host + ':' + global.SixCRM.configuration.site_config.redshift.port +
          '/' + global.SixCRM.configuration.site_config.redshift.database;

        stream_parameters[key].RoleARN = 'arn:aws:iam::' + global.SixCRM.configuration.site_config.aws.account +
          ':role/' + global.SixCRM.configuration.site_config.kinesis.firehose.streams[stream][key].RoleARN;
        stream_parameters[key].S3Configuration.RoleARN = 'arn:aws:iam::' + global.SixCRM.configuration.site_config.aws.account +
          ':role/' + global.SixCRM.configuration.site_config.kinesis.firehose.streams[stream][key].S3Configuration.RoleARN;

      } else {
        stream_parameters[key] = global.SixCRM.configuration.site_config.kinesis.firehose.streams[stream][key];
      }

    });

    return stream_parameters;

  }


  streamExists(stream_identifier) {
    /* Test if stream exists */

    var parameters = {
      DeliveryStreamName: stream_identifier
    };

    return new Promise((resolve) => {
      this.kinesis.describeDeliveryStream(parameters, (error, data) => {
        if (error) {
          return resolve(false);
        } else {
          if (data) { // test for properties///
          }
          return resolve(true);
        }
      });
    });

  }

  createStream(parameters) {
    /* Create stream */

    return new Promise((resolve, reject) => {
      this.kinesis.createDeliveryStream(parameters, (error, data) => {
        if (error) {
          du.error(error.message);
          return reject(error);
        } else {
          return resolve(data);
        }
      });
    });
  }

  createStreamAndWait(parameters) {
    return this.createStream(parameters).then(() => {
      return this.waitForStreamToExist(parameters.DeliveryStreamName);
    });
  }

  deleteStream(parameters) {
    /* Delete stream */

    return new Promise((resolve, reject) => {
      this.kinesis.deleteDeliveryStream(parameters, (error, data) => {
        if (error) {
          du.error(error.message);
          return reject(error);
        } else {
          return resolve(data);
        }
      });
    });
  }

  deleteStreamAndWait(parameters) {
    /* Delete stream and wait */

    return this.deleteStream(parameters).then(() => {
      return this.waitForStreamNotExist(parameters.DeliveryStreamName);
    });
  }

  waitForStream(stream_identifier, state) {
    /* Wait for stream  */

    let parameters = {
      StreamIdentifier: stream_identifier
    };

    return new Promise((resolve) => {

      this.kinesis.describeDeliveryStream(parameters, (err, data) => {
        if (err) {
          return resolve(false);
        }

        if (data.DeliveryStreamDescription.DeliveryStreamStatus === state) {
          du.output(stream_identifier + ' is now active');
          return resolve(true);
        }

        setTimeout(function() {
          this.waitForStream(stream_identifier, state);
        }, 1000);
      });
    });
  }

  waitForStreamToExist(stream_identifier) {
    /* Exists wrapper */
    return this.waitForStream(stream_identifier, 'ACTIVE');
  }

  waitForStreamNotExist(stream_identifier) {
    /* Exists wrapper */
    return this.waitForStream(stream_identifier, 'DELETING');
  }

}
