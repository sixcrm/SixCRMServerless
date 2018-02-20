'use strict';
const AWS = require("aws-sdk");
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib','object-utilities.js');

class SNSUtilities {

    constructor(){

      var parameters = {apiVersion: 'latest', region: 'us-east-1'};

      this.sns = new AWS.SNS(parameters);

    }

    createTopic(parameters){

      du.debug('Create Topic');

      let params = objectutilities.transcribe(
        {
          Name:'Name'
        },
        parameters,
        {},
        true
      );

      return new Promise((resolve, reject) => {
        this.sns.createTopic(params, function(error, data) {
          if (error){
            du.error(error);
            return reject(error);
          }
          return resolve(data);
        });
      });

    }

    addPermission(parameters){

      du.debug('Add Permission');

      let params = objectutilities.transcribe(
        {
          AWSAccountId:'aws_account_id',
          ActionName: 'action_name',
          Label:'label',
          TopicArn:'topic_arn'
        },
        parameters,
        {},
        true
      );

      return new Promise((resolve, reject) => {
        this.sns.addPermission(params, function(error, data) {
          if (error){
            du.error(error);
            return reject(error);
          }
          return resolve(data);
        });
      });

    }

    subscribe(parameters){

      du.debug('Subscribe');

      let params = objectutilities.transcribe(
        {
          Protocol:'Protocol',
          TopicArn:'TopicArn'
        },
        parameters,
        {},
        true
      );

      params = objectutilities.transcribe(
        {
          Endpoint:'Endpoint',
        },
        parameters,
        params
      );

      return new Promise((resolve, reject) => {
        this.sns.subscribe(params, function(error, data) {
          if (error){
            du.error(error);
            return reject(error);
          }
          return resolve(data);
        });
      });

    }

    publish(parameters){

      du.debug('Publish');

      let params = objectutilities.transcribe(
        {
          Message:'Message'
        },
        parameters,
        {},
        true
      );

      params = objectutilities.transcribe(
        {
          MessageAttributes:'MessageAttributes',
          MessageStructure: 'MessageStructure',
          PhoneNumber: 'PhoneNumber',
          Subject:'Subject',
          TargetArn: 'TargetArn',
          TopicArn: 'TopicArn'
        },
        parameters,
        params,
        false
      );

      return new Promise((resolve, reject) => {
        this.sns.publish(params, function(error, data) {
          if (error){
            du.error(error);
            return reject(error);
          }
          return resolve(data);
        });
      });

    }

    sendSMS(text, phone_number) {

        return new Promise((resolve, reject) => {
            let params = {
                Message: text,
                PhoneNumber: phone_number,
            };

            du.debug('Sending SMS message with parameters', params);

            this.sns.publish(params, (error, data) => {
                if (error) {
                    du.debug('SNS Error!', error);

                    return reject(error);
                }

                if (data) {
                    du.debug('SNS Success:', data);

                    return resolve(data);
                }
            });
        });

    }

}

module.exports = new SNSUtilities();
