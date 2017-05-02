'use strict'
const AWS = require("aws-sdk");
const _ = require('underscore');
const du = require('./debug-utilities.js');

class KinesisFirehoseUtilities {

    constructor(){

        this.firehose = new AWS.Firehose({
            apiVersion: '2015-08-04',
            region: process.env.aws_region
        })

        this.setStreams();

    }

    putRecord(stream, record){

        du.debug('Put Record');

        return new Promise((resolve, reject) => {

            this.validateStream(stream);

            this.validateStreamRecord(stream, record);

            var params = {
                Record:{
                    Data: JSON.stringify(stream)
                },
                DeliveryStreamName: stream
            };

            this.firehose.putRecord(params, (error, data) => {
                if (error){ return reject(error); }
                return resolve(data);
            });

        });

    }

    validateStream(stream){

        du.debug('Validate Stream');

        if(!_.contains(this.configured_streams, stream)){

            throw new Error('Unrecognized Kinesis Firehose Stream Name: '+stream, 'Configured Streams: ', this.configured_streams);

        }

        return true;

    }

    validateStreamRecord(stream, record){

        du.debug('Validate Stream Record');

      //get validator
      //get validator json
      //validate

        return true;

    }

    setStreams(){

        du.debug('Set Stream Names');

        let streams = [];

        if(_.has(process.env, 'kinesis_firehose_streams')){

            this.configured_streams = process.env.kinesis_firehose_streams.split(',');

        }else{

            throw new Error('Unable to identify enabled Kinesis Firehose Streams.');

        }

        return streams;

    }

}

module.exports = new KinesisFirehoseUtilities();
