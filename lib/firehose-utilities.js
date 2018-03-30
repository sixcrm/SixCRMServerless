'use strict'
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const AWSUtilities = global.SixCRM.routes.include('lib', 'providers/aws-utilities.js');

class FirehoseUtilities extends AWSUtilities {

    constructor(){

      super();

      this.firehose = new this.AWS.Firehose({
          apiVersion: '2015-08-04',
          region: this.getRegion()
      });

    }


    streamExists() {

      let parameters = this.createParametersObject('describe');

      return new Promise((resolve) => {

          return this.firehose.describeDeliveryStream(parameters, (error, data) => {
              if (error) {
                  return resolve(false);
              } else {
                if(_.has(data, 'DeliveryStreamDescription')){
                  return resolve(true);
                }else{
                  return resolve(false)
                }

              }
          });

      });

    }

    deleteStream() {

      let parameters = this.createParametersObject('destroy');

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

    waitForStream(state) {

        let parameters = this.createParametersObject('wait');

        return new Promise((resolve) => {

          this.kinesis.describeDeliveryStream(parameters,(err, data) => {
            /* 21.07.2017 A.Zelen Sadly There is no native functionality for waiting  */
            if (err) {
              return resolve(false);
            }

            if (data.DeliveryStreamDescription.DeliveryStreamStatus === state){
              du.output(parameters.DeliveryStreamName+' is now active');
              return resolve(true);
            }

            setTimeout(function() {
              this.waitForStream(parameters, state);
            }, 1000);
        });
      });
    }


    createStream() {

        let parameters = this.createParametersObject('create');

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

    createParametersObject(group_name){

      let response_object = {};

      let configuration_groups = {
        'describe': ['DeliveryStreamName'],
        'wait': ['DeliveryStreamName'],
        'create': ['DeliveryStreamName','ClusterJDBCURL','DataTableName','CopyOptions','Password','RoleARN','BucketARN','IntervalInSeconds','SizeInMBs','CompressionFormat','Prefix','Username','DurationInSeconds','S3BackupMode'],
        'destroy': ['DeliveryStreamName']
      }

      /* A.Zelen There is no case translation in Kinesis but leaving it here just in case */
      let translation_object = {
        DeliveryStreamName: ['DeliveryStreamName'],
        ClusterJDBCURL: ['ClusterJDBCURL'],
        DataTableName: ['DataTableName'],
        CopyOptions: ['CopyOptions'],
        Password: ['Password'],
        RoleARN: ['RoleARN'],
        BucketARN: ['BucketARN'],
        IntervalInSeconds: ['IntervalInSeconds'],
        SizeInMBs: ['SizeInMBs'],
        CompressionFormat: ['CompressionFormat'],
        Prefix: ['Prefix'],
        Username: ['Username'],
        DurationInSeconds: ['DurationInSeconds'],
        S3BackupMode: ['S3BackupMode']
      };

      configuration_groups[group_name].forEach((key) => {
        // A.Zelen Need to add JSON reading of a specified stream via stram name or instantiete one object for every stream
        let discovered_data = objectutilities.recurseByDepth(global.SixCRM.configuration.site_config.kinesis, function(p_key){

          return (_.contains(translation_object[key], p_key));

        });

        response_object[key] = discovered_data;

      });

      //validate

      return response_object;

    }

}

module.exports = new FirehoseUtilities();
