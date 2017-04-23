'use strict'
const AWS = require("aws-sdk");
const _ = require('underscore');
const du = require('./debug-utilities.js');

class KinesisUtilities {

    constructor(stage){

        du.debug('Using remote dynamodb.');

        this.kinesis = new AWS.Kinesis({apiVersion: '2013-12-02'})

    }

    putRecord(record, stream){

        return new Promise((resolve, reject) => {

            let stream_config = this.getStreamConfig(stream);

            var params = {
                Data: record,
                PartitionKey: stream_config.partition_key,
                StreamName: stream_config.name
            };

            this.kinesis.putRecord(params, (error, data) => {
                if (error){ return reject(error); }
                return resolve(data);
            });

        });

    }

    getStreamConfig(stream){

        return {
            partition_key: '',
            name: ''
        };

    }

}

module.exports = new KinesisUtilities(process.env.stage);
