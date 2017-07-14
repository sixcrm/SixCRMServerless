'use strict';
const fs = require('fs');
const _ = require('underscore');

const AWS = require("aws-sdk");

const du = global.routes.include('lib', 'debug-utilities.js');
const configurationutilities = global.routes.include('lib', 'configuration-utilities.js');
const stringutilities = global.routes.include('lib', 'string-utilities.js');

class KinesisDeployment {

    constructor(stage) {

      this.stage = configurationutilities.resolveStage(stage);
      this.site_config = configurationutilities.getSiteConfig(this.stage);

      this.kinesis = new AWS.Firehose({
          region: this.site_config.aws.region,
          apiVersion: '2015-08-04',
      });

    }

    deployStreams(){

      let stream_list = Object.keys(this.site_config.kinesis.firehose.streams).filter(name => name.match(/\_stream$/));

      stream_list.map(stream => {

        let stream_parameters = {};

        Object.keys(this.site_config.kinesis.firehose.streams[stream]).forEach((key) => {

            stream_parameters[key] = this.site_config.kinesis.firehose.streams[stream][key];

        });

        this.streamExists(stream_parameters.DeliveryStreamName).then(exists => {
            if (exists) {
                du.warning('Stream exists, aborting.');
                return Promise.resolve();
            } else {
                du.output('Stream does not exist, creating.');
                return this.createStreamAndWait(stream_parameters).then(response => {
                  du.output(response);
                });
            }
        })
        .then(() => {
          du.highlight('Complete')
        });

      });

    }

    streamExists(stream_identifier) {
       /* Test if stream exists */

       var parameters = {
           DeliveryStreamName: stream_identifier
       };

       return new Promise((resolve, reject) => {
           this.kinesis.describeDeliveryStream(parameters, (error, data) => {
               if (error) {
                   return resolve(false);
               } else {
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

        return new Promise((resolve, reject) => {

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
