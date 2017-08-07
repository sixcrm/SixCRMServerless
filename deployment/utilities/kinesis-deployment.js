'use strict';

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const fileutilities = global.SixCRM.routes.include('lib', 'file-utilities.js');
const AWSDeploymentUtilities = global.SixCRM.routes.include('deployment', 'utilities/aws-deployment-utilities.js');

module.exports = class KinesisDeployment extends AWSDeploymentUtilities {

  constructor() {

    super();

    this.kinesisfirehosetutilities = global.SixCRM.routes.include('lib', 'kinesis-firehose-utilities.js');

  }

  destroyStreams() {

  }

  getStreamConfigurations(){

    du.debug('Get Stream Configurations');

    return fileutilities.getDirectoryFiles(global.SixCRM.routes.path('deployment', 'kinesis/streams')).then((filenames) => {
      return arrayutilities.map(filenames, (filename) => {
        return global.SixCRM.routes.include('deployment', 'kinesis/streams/'+filename);
      });
    });

  }

  deployStreams() {

    du.debug('Deploy Streams');

    return this.getStreamConfigurations().then((stream_configurations) => {

      return global.SixCRM.configuration.getEnvironmentConfig('redshift.host').then((host) => {

        let stream_create_promises = arrayutilities.map(stream_configurations, (stream_configuration) => {

          return () => {

            return this.kinesisfirehosetutilities.streamExists(stream_configuration.DeliveryStreamName).then(exists => {

              if (exists) {

                du.output('Stream exists, skipping');

                return false;

              } else {

                du.output('Stream does not exist, creating.');

                return this.createStreamAndWait(stream_configuration).then(response => {

                  du.highlight('Stream created.');

                  return true;

                });

              }

            });

          }

        });

        return arrayutilities.serial(stream_create_promises).then(() => {
          return 'Complete';
        });

      });

    });

  }

  createStreamAndWait(parameters) {
    return this.kinesisfirehosetutilities.createStream(parameters).then(() => {
      return this.kinesisfirehosetutilities.waitForStreamToExist(parameters.DeliveryStreamName);
    });
  }

  deleteStreamAndWait(parameters) {
    return this.kinesisfirehosetutilities.deleteStream(parameters).then(() => {
      return this.kinesisfirehosetutilities.waitForStreamNotExist(parameters.DeliveryStreamName);
    });
  }

  waitForStreamToExist(stream_identifier) {
    return this.kinesisfirehosetutilities.waitForStream(stream_identifier, 'ACTIVE');
  }

  waitForStreamNotExist(stream_identifier) {
    return this.kinesisfirehosetutilities.waitForStream(stream_identifier, 'DELETING');
  }

}
