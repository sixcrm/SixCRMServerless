'use strict'
const AWS = require("aws-sdk");
const _ = require('underscore');
var Validator = require('jsonschema').Validator;

const du = global.routes.include('lib', 'debug-utilities.js');

class KinesisFirehoseUtilities {

    constructor(){

        this.firehose = new AWS.Firehose({
            apiVersion: '2015-08-04',
            region: process.env.aws_region
        })

        this.setKinesisFirehoseNames();

    }

    //Technical Debt:  This should only have two arguments:  stream and record.  The stream should indicate the environment specific stream name.
    putRecord(firehose, record, validation_model){

        du.debug('Put Record');

        if(_.isUndefined(validation_model)){
            validation_model = firehose;
        }

        return new Promise((resolve, reject) => {

            this.validateStreamRecord(validation_model, record);

            var params = {
                Record:{
                    Data: JSON.stringify(record)
                },
                DeliveryStreamName: this.getKinesisFirehoseName(firehose)
            };

            du.warning(params);

            this.firehose.putRecord(params, (error, data) => {
                if (error){ return reject(error); }
                return resolve(data);
            });

        });

    }

    validateStreamRecord(validation_model, object){

        du.debug('Validate Stream Record');

        var v = new Validator();

        var schema;

        try{

            let schema_path = '../model/kinesisfirehose/'+validation_model+'.json';

            schema = require(schema_path);

        } catch(e){

            du.warning(e);

            throw new Error('Unable to load validation schema for Kinesis Firehose '+validation_model+' model.');

        }

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

        du.debug('Object validated: ', object);

        return true;

    }

    getKinesisFirehoseName(stream){

        if(_.has(this.configured_streams, stream)){

            return this.configured_streams[stream];

        }

        throw new Error('Unset stream name: '+stream);

    }

    setKinesisFirehoseNames(){

        du.debug('Set Firehose Names');

        //Technical Debt:  This should be configured.
        this.configured_streams = {
            events: process.env.kinesis_firehose_events_stream,
            transactions: process.env.kinesis_firehose_transactions_stream
        };

    }

}

module.exports = new KinesisFirehoseUtilities();
