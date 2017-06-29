'use strict';
require('require-yaml');
const fs = require('fs');
const _ = require('underscore');
const AWS = require("aws-sdk");

const du = global.routes.include('lib', 'debug-utilities.js');

class KinesisDeployment {

    constructor(stage) {
        this.stage = stage;
        this.config = this.getConfig(stage);
        this.kinesis = new AWS.Firehose({
            region: 'us-east-1',
            apiVersion: '2015-08-04',
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
              waitForStream(stream_identifier, state);
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

    getConfig() {
        let config = global.routes.include('config', `${this.stage}/site.yml`).kinesis.firehose;

        if (!config) {
            throw 'Unable to find config file.';
        }
        return config;
    }

}

module.exports = KinesisDeployment;
