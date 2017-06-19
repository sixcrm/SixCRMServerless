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
        this.redshift = new AWS.Redshift({
            region: 'us-east-1',
            apiVersion: '2013-01-01',
        });
    }

    clusterExists(cluster_identifier) {
       /* Test if stream exists */
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
