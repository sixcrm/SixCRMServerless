'use strict'
const AWS = require("aws-sdk");
const _ = require('underscore');
var Validator = require('jsonschema').Validator;

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

class KinesisFirehoseUtilities {

    constructor(){

        this.firehose = new AWS.Firehose({
            apiVersion: '2015-08-04',
            region: process.env.aws_region
        })

        this.setKinesisFirehoseNames();

        this.localBypass();

    }

    localBypass(){

        du.debug('Local Bypass');

        if(_.has(process.env, 'stage') && _.contains(['development','staging','production'], process.env.stage)){

        //we're good...

        }else{

            this.putRecord = () => {

                return Promise.resolve('Kinesis streams disabled.');

            };

        }

    }

    //Technical Debt:  This should only have two arguments:  stream and record.  The stream should indicate the environment specific stream name.
    putRecord(firehose, record, validation_model){

        du.debug('Put Record');

        record = this.sanitizeRecord(record);

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

            try{
              this.firehose.putRecord(params, (error, data) => {
                if(error){
                  return reject(error);
                }
                return resolve(data);
              });
            }catch(error){
              du.error(error);
              if (error){ return reject(error); }
            }

        });

    }

    //Technical Debt:  Use Model Validator Utilities
    validateStreamRecord(validation_model, object){

        du.debug('Validate Stream Record');

        var v = new Validator();

        var schema;

        try{

            let schema_path = '../model/kinesisfirehose/'+validation_model+'.json';

            schema = require(schema_path);

        } catch(e){

            du.warning(e);

            eu.throwError('server','Unable to load validation schema for Kinesis Firehose '+validation_model+' model.');

        }

        var validation;

        try{

            v = new Validator();
            validation = v.validate(object, schema);

        }catch(e){

            eu.throwError('server','Unable to instantiate validator.');

        }

        if(_.has(validation, "errors") && _.isArray(validation.errors) && validation.errors.length > 0){

            du.warning(validation);
            var error = {
                message: 'One or more validation errors occurred',
                issues: validation.errors.map((e)=>{ return e.message; })
            };

            eu.throwError('server', error.message+': '+error.issues);

        }

        du.debug('Object validated: ', object);

        return true;

    }

    getKinesisFirehoseName(stream){

        du.debug('Get Kinesis Firehose Name');

        if(_.has(this.configured_streams, stream)){

            return this.configured_streams[stream];

        }

        eu.throwError('server','Unset stream name: '+stream);

    }

    setKinesisFirehoseNames(){

        du.debug('Set Firehose Names');

        if(_.has(process.env, 'stage')){

            this.configured_streams = {
                events: 'six-'+process.env.stage+'-events',
                transactions: 'six-'+process.env.stage+'-transactions',
                activity: 'six-'+process.env.stage+'-activity'
            };

        }

    }

    sanitizeRecord(record){
        for(var k in record){
            if(_.isUndefined(record[k])){
                record[k] = '';
            }
        }
        return record;
    }

}

module.exports = new KinesisFirehoseUtilities();
