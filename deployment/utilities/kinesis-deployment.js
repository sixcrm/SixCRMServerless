'use strict';
const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const fileutilities = global.SixCRM.routes.include('lib', 'file-utilities.js');
const parserutilities = global.SixCRM.routes.include('lib', 'parser-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const AWSDeploymentUtilities = global.SixCRM.routes.include('deployment', 'utilities/aws-deployment-utilities.js');

module.exports = class KinesisDeployment extends AWSDeploymentUtilities {

  constructor() {

    super();

    this.kinesisfirehosetutilities = global.SixCRM.routes.include('lib', 'kinesis-firehose-utilities.js');

  }

  destroyStreams() {

    du.debug('Destroy Streams');

    return this.getStreamConfigurations().then((stream_configurations) => {

      let stream_create_promises = arrayutilities.map(stream_configurations, (stream_configuration) => {

        return () => {

          if(!_.has(stream_configuration, 'DeliveryStreamName')){
            eu.throwError('server', 'destroyStreams assumes stream_configuration object with property "DeliveryStreamName"');
          }

          let stream_name = stream_configuration.DeliveryStreamName;

          return this.kinesisfirehosetutilities.streamExists(stream_name).then(exists => {

            if (!exists) {

              du.output('Stream does not exist ('+stream_name+'), skipping');

              return false;

            } else {

              du.output('Stream exists, destroying.');

              let parameters = objectutilities.additiveFilter(['DeliveryStreamName'], stream_configuration);

              return this.deleteStreamAndWait(parameters).then(() => {

                du.highlight('Stream "'+stream_name+'" destroyed.');

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

  }

  deployStreams() {

    du.debug('Deploy Streams');

    return this.getStreamConfigurations().then((stream_configurations) => {

      let stream_create_promises = arrayutilities.map(stream_configurations, (stream_configuration) => {

        return () => {

          if(!_.has(stream_configuration, 'DeliveryStreamName')){
            eu.throwError('server', 'deployStreams assumes stream_configuration object with property "DeliveryStreamName"');
          }

          let stream_name = stream_configuration.DeliveryStreamName;

          return this.kinesisfirehosetutilities.streamExists(stream_name).then(exists => {

            if (exists) {

              du.output('Stream exists ('+stream_name+'), skipping');

              return false;

            } else {

              du.output('Stream does not exist ('+stream_name+'), creating.');

              return this.parseStreamConfiguration(stream_configuration).then((stream_configuration) => {

                return this.createStreamAndWait(stream_configuration).then(() => {

                  du.highlight('Stream "'+stream_name+'" created.');

                  return true;

                });

              });

            }

          });

        }

      });

      return arrayutilities.serial(stream_create_promises).then(() => {
        return 'Complete';
      });

    });

  }

  getStreamConfigurations(){

    du.debug('Get Stream Configurations');

    return fileutilities.getDirectoryFiles(global.SixCRM.routes.path('deployment', 'kinesis/streams')).then((filenames) => {
      return arrayutilities.map(filenames, (filename) => {
        return global.SixCRM.routes.include('deployment', 'kinesis/streams/'+filename);
      });
    });

  }

  parseStreamConfiguration(stream_configuration){

    du.debug('Parse Stream Configuration');

    return global.SixCRM.configuration.getEnvironmentConfig('redshift.host').then((redshift_host) => {

      let configuration_tokens = {
        redshift_host: redshift_host,
        redshift_port: global.SixCRM.configuration.site_config.redshift.port,
        redshift_database: global.SixCRM.configuration.site_config.redshift.database,
        redshift_username: global.SixCRM.configuration.site_config.redshift.user,
        redshift_password: global.SixCRM.configuration.site_config.redshift.password,
        aws_account_id: global.SixCRM.configuration.site_config.aws.account,
        stage: process.env.stage
      };

      stream_configuration = JSON.stringify(stream_configuration);

      stream_configuration = parserutilities.parse(stream_configuration, configuration_tokens);

      return JSON.parse(stream_configuration);

    });

  }

  createStreamAndWait(parameters) {

    if(!_.has(parameters, 'DeliveryStreamName')){
      eu.throwError('server', 'createStreamAndWait assumes a parameters object with property "DeliveryStreamName"');
    }

    return this.kinesisfirehosetutilities.createStream(parameters).then(() => {
      return this.waitForStreamToExist(parameters.DeliveryStreamName);
    });
  }

  deleteStreamAndWait(parameters) {

    du.debug('Delete Stream And Wait');

    if(!_.has(parameters, 'DeliveryStreamName')){
      eu.throwError('server', 'deleteStreamAndWait assumes a parameters object with property "DeliveryStreamName"');
    }

    return this.kinesisfirehosetutilities.deleteStream(parameters).then(() => {
      return this.waitForStreamNotExist(parameters.DeliveryStreamName);
    });
  }

  //Technical Debt:  These don't appear to work...

  waitForStreamToExist(stream_identifier) {
    return this.kinesisfirehosetutilities.waitForStream(stream_identifier, 'ACTIVE');
  }

  waitForStreamNotExist(stream_identifier) {
    return this.kinesisfirehosetutilities.waitForStream(stream_identifier, 'DELETING');
  }

}
