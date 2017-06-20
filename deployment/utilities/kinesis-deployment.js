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
        this.kinesis = new AWS.Kinesis({
            region: 'us-east-1',
            apiVersion: '2013-12-02',
        });
    }

    streamExists(stream_identifier) {
       /* Test if stream exists */

       let parameters = {
           StreamName: stream_identifier
       };
       console.log(parameters);
       return new Promise((resolve, reject) => {
           this.kinesis.describeStream(parameters, (error, data) => {
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
    }

    createStreamAndWait(parameters) {
        /* Create stream and wait */
    }

    deleteStream(parameters) {
        /* Delete stream */
    }

    deleteStreamAndWait(parameters) {
        /* Delete stream and wait */
    }

    waitForStream(stream_identifier, state) {
        /* Wait for stream creation */
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
