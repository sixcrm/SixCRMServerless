'use strict';
const AWS = require("aws-sdk");

const du = global.routes.include('lib', 'debug-utilities.js');
const configurationutilities = global.routes.include('lib', 'configuration-utilities.js');

class KinesisDeployment {

    constructor(stage) {

      this.stage = configurationutilities.resolveStage(stage);
      this.site_config = configurationutilities.getSiteConfig(this.stage);

      this.kinesis = new AWS.Firehose({
          region: this.site_config.aws.region,
          apiVersion: '2015-08-04',
      });

    }

    destroyStreams(){

      let stream_list = this.getStreamList();

      let destroy_promises = stream_list.map(stream =>  {

        let stream_parameters = {
          DeliveryStreamName: this.site_config.kinesis.firehose.streams[stream].DeliveryStreamName
        };

        du.output('Attempting to destroy "'+stream_parameters.DeliveryStreamName+'"');

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

      return Promise.all(destroy_promises).then(() => {

        return 'Process Complete.'

      });

    }

    getStreamList(){

      return Object.keys(this.site_config.kinesis.firehose.streams).filter(name => name.match(/\_stream$/));

    }

    deployStreams(){

      let stream_list = this.getStreamList();

      let deployment_promises = stream_list.map((stream) => {

        du.output('Attempting to create "'+this.site_config.kinesis.firehose.streams[stream].DeliveryStreamName+'"');

        let stream_parameters = {};

        Object.keys(this.site_config.kinesis.firehose.streams[stream]).forEach((key) => {

            stream_parameters[key] = this.site_config.kinesis.firehose.streams[stream][key];

        });

        return this.streamExists(stream_parameters.DeliveryStreamName).then(exists => {

            if (exists) {

                du.warning('Stream exists.');

                return Promise.resolve();

            } else {

                du.output('Stream does not exist, creating.');

                return this.createStreamAndWait(stream_parameters).then(response => {

                  du.output('AWS Response: '+response);

                  return true;

                });

            }

        }).then(() => {

          du.highlight('Stream created.');

        }).catch(error => {

          du.error(error);

        });

      });

      return Promise.all(deployment_promises).then(() => {

        return 'Process Complete.';

      });

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
                  if(data){ // test for properties///
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

          this.kinesis.describeDeliveryStream(parameters,(err, data) => {
            if (err) {
              return resolve(false);
            }

            if (data.DeliveryStreamDescription.DeliveryStreamStatus === state){
              du.output(stream_identifier+' is now active');
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

module.exports = KinesisDeployment;
