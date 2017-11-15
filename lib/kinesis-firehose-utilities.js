'use strict'
const AWS = require("aws-sdk");
const _ = require('underscore');
var Validator = require('jsonschema').Validator;

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const numberutilities = global.SixCRM.routes.include('lib', 'number-utilities.js');
const AWSUtilities = global.SixCRM.routes.include('lib', 'aws-utilities.js')

class KinesisFirehoseUtilities extends AWSUtilities{

    constructor(){

      super();

      this.firehose = new AWS.Firehose({
          apiVersion: '2015-08-04',
          region: process.env.aws_region
      })

      //deprecated-ish
      this.setKinesisFirehoseNames();

      this.localBypass();

      this.attempt_count_max = 200;

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

            du.error(e); process.exit()

            eu.throwError('server','Unable to load validation schema for Kinesis Firehose '+validation_model+' model.');

        }

        var validation;

        try{

            v = new Validator();
            validation = v.validate(object, schema);

        }catch(e){

          du.error(e);

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

          //Technical Debt:  This has to go
            this.configured_streams = {
                events: 'events',
                transactions: 'transactions',
                activity: 'activity',
                queues: 'queues'
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

    streamExists(stream_identifier) {
      /* Test if stream exists */

      var parameters = {
        DeliveryStreamName: stream_identifier
      };

      return new Promise((resolve) => {
        this.firehose.describeDeliveryStream(parameters, (error, data) => {
          if (error) {
            return resolve(false);
          } else {
            if (data) { // test for properties///

            }
            return resolve(true);
          }
        });
      });

    }

    createStream(parameters) {
      /* Create stream */

      return new Promise((resolve, reject) => {
        this.firehose.createDeliveryStream(parameters, (error, data) => {
          if (error) {
            du.error(error.message);
            return reject(error);
          } else {
            return resolve(data);
          }
        });
      });
    }

    deleteStream(parameters) {

      du.debug('Delete Stream');

      return new Promise((resolve, reject) => {

        this.firehose.deleteDeliveryStream(parameters, (error, data) => {
          if (error) {
            du.error(error.message);
            return reject(error);
          } else {
            return resolve(data);
          }
        });

      });

    }

    describeStream(parameters){

      du.debug('Describe Stream');

      return new Promise((resolve) => {

        this.firehose.describeDeliveryStream(parameters, (error, data) => resolve(this.AWSCallback(error, data)));

      });

    }

    waitForStream(stream_identifier, state, attempt_count) {

      du.debug('Wait For Stream');

      if(_.isUndefined(attempt_count)){
        attempt_count = 1;
      }

      let parameters = {DeliveryStreamName: stream_identifier};

      return this.describeStream(parameters).then((data) => {

        if(!_.has(data, 'DeliveryStreamDescription') || !_.has(data.DeliveryStreamDescription, 'DeliveryStreamStatus')){
          eu.throwError('server', 'Unexpected response structure from AWS');
        }

        if (data.DeliveryStreamDescription.DeliveryStreamStatus === state){

          du.output('Stream status: "'+state+'"!');

          return true;

        }else{

          if(attempt_count < this.attempt_count_max){

            attempt_count++;

            du.output('Stream status: "'+data.DeliveryStreamDescription.DeliveryStreamStatus+'" - pausing ('+numberutilities.appendOrdinalSuffix(attempt_count)+' attempt...)');

            return timestamp.delay(1000)().then(() => {

              return this.waitForStream(stream_identifier, state, attempt_count);

            });

          }

          eu.throwError('server', 'waitForStream attempt_count_max exceeded.');

        }

      });

    }

}

module.exports = new KinesisFirehoseUtilities();
