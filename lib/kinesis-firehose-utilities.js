'use strict'
const AWS = require("aws-sdk");
const _ = require('underscore');
const du = require('./debug-utilities.js');
var validator = require('validator');
var Validator = require('jsonschema').Validator;

class KinesisFirehoseUtilities {

    constructor(){

        this.firehose = new AWS.Firehose({
            apiVersion: '2015-08-04',
            region: process.env.aws_region
        })

        this.setStreams();

    }

    //Technical Debt:  This should only have two arguments:  stream and record.  The stream should indicate the environment specific stream name.
    putRecord(stream, record, validation_model){

        du.debug('Put Record');

        return new Promise((resolve, reject) => {

            this.validateStream(stream);

            this.validateStreamRecord(validation_model, record);

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

    validateStreamRecord(validation_model, object){

        du.debug('Validate Stream Record');

        var v = new Validator();

        var schema;

        try{

            let schema_path = '../model/kinesisfirehose/'+validation_model;

            du.debug('Schema path: '+schema_path);

            schema = require(schema_path);

        } catch(e){

            du.warning(e);

            throw new Error('Unable to load validation schema for Kinesis Firehose '+validation_model+' model.');

        }

        du.debug('Validation Schema loaded');

        var validation;

        try{

            v = new Validator();
            validation = v.validate(object, schema);

        }catch(e){

            throw new Error('Unable to instantiate validator.');

        }

        if(_.has(validation, "errors") && _.isArray(validation.errors) && validation.errors.length > 0){

            var error = {
                message: 'One or more validation errors occurred',
                issues: validation.errors.map((e)=>{ return e.message; })
            };

            throw new Error(error.message+': '+error.issues);

        }

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
