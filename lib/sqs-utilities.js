'use strict'
const AWS = require("aws-sdk");
const _ = require('underscore');

const du = global.routes.include('lib', 'debug-utilities.js');
const eu = global.routes.include('lib', 'error-utilities.js');
const parserutilities = global.routes.include('lib', 'parser-utilities.js');

class SQSUtilities {

    constructor(){

        this.sqs = new AWS.SQS({region: 'us-east-1'});

        this.deadletter_postfix = '_deadletter';

        this.queue_url_template = 'https://sqs.{{region}}.amazonaws.com/{{account}}/{{queue_name}}';

        this.queue_arn_template = 'arn:aws:sqs:{{region}}:{{account}}:{{queue_name}}';

    }

    getQueueARN(queue_name){

      du.debug('Get Queue ARN');

      let parameters = this.getQueueParameters(queue_name);

      return parserutilities.parse(this.queue_arn_template, parameters);

    }

    getQueueURL(input){

      let queue_name = null;

      if(_.isString(input)){
        queue_name = input;
      }else if(_.isObject(input)){
        if(_.has(input, 'queue') && _.isString(input.queue)){
          queue_name = input.queue;
        }
      }

      let parameters = this.getQueueParameters(queue_name);

      return parserutilities.parse(this.queue_url_template, parameters);

    }

    getQueueParameters(queue_name){

      du.debug('Get Queue Parameters');

      if(_.isNull(queue_name) || _.isUndefined(queue_name)){
        eu.throwError('server', 'Unable to determine queue name.');
      }

      if(!_.has(process.env, 'aws_region')){
        eu.throwError('server', 'Unable to determine AWS region.');
      }

      if(!_.has(process.env, 'aws_account')){
        eu.throwError('server', 'Unable to determine AWS account.');
      }

      let parameters = {
        'region': process.env.aws_region,
        'account': process.env.aws_account,
        'queue_name': queue_name
      };

      return parameters;

    }

    receiveMessages(parameters) {

        return new Promise((resolve, reject) => {

            let params = {};

            let queue_url = this.getQueueURL(parameters);

            params['QueueUrl'] = queue_url;

            if(_.has(parameters, 'limit')){
                params['MaxNumberOfMessages'] = parameters['limit'];
            }

            du.debug('Message parameters', params);

            this.sqs.receiveMessage(params, function(error, data) {
                if (error) {
                    du.warning(error);
                    return reject(error);
                } else {
                    return resolve(data.Messages);
                }
            });

        });
    }

    deleteMessages(parameters){

        return new Promise((resolve, reject) => {

            let entries = [];

            du.debug('Messages to delete:', parameters);

            if(_.has(parameters, 'messages')){
                parameters.messages.forEach((message) => {
                    du.debug('Message to delete:', message);
                    if(_.has(message, 'ReceiptHandle') && _.has(message, 'MessageId')){
                        entries.push({
                            Id: message.MessageId,
                            ReceiptHandle: message.ReceiptHandle
                        });
                    }
                });
            }

            if(entries.length > 0){

                let params = {
                    Entries: entries
                };

                let queue_url = this.getQueueURL(parameters);

                params['QueueUrl'] = queue_url;

                du.debug('Delete message parameters:', params);

                this.sqs.deleteMessageBatch(params, function(err, data) {

                    if (err){

                        du.warning(err);

                        return reject(err)

                    }else{

                        if(_.has(data, 'Failed') && _.isArray(data.Failed) && data.Failed.length > 0){
                            du.warning('Failed to delete messages: ', data.Failed);
                        }

                        du.debug('Delete response: ', data);

                        return resolve(data);
                    }

                });

            }else{

                du.warning('No messages to delete.  Might want to check functional usage.');

                return resolve(false);

            }

        });

    }

    deleteMessage(parameters, callback){

      let queue_url = this.getQueueURL(parameters);

      var params = {
          QueueUrl: queue_url,
          ReceiptHandle: parameters.receipt_handle
      };

      this.sqs.deleteMessage(params, function(error, data) {
          if(error){
              callback(error, error.stack);
          }else{
              callback(null, data);
          }
      });

    }

    sendMessage(parameters, callback){

      let queue_url = this.getQueueURL(parameters);

      var params = {
          MessageBody: parameters.message_body,
          QueueUrl: queue_url,
          DelaySeconds: 30,
			/*
			MessageAttributes: {
				someKey: {
					DataType: 'STRING_VALUE',
					BinaryListValues: [
						new Buffer('...') || 'STRING_VALUE',
					],
					BinaryValue: new Buffer('...') || 'STRING_VALUE',
					StringListValues: [
						'STRING_VALUE',
					],
					StringValue: 'STRING_VALUE'
				},

			}
			*/
        };

        du.debug('Sending message', params);

        this.sqs.sendMessage(params, function(error, data) {
            if (error){
                callback(error, error.stack);
            }else{
                callback(null, data);
            }
        });


    }

    purgeQueue(parameters, callback){

      let queue_url = this.getQueueURL(parameters);

      var params = {QueueUrl: queue_url};

      this.sqs.purgeQueue(params, function(err, data) {
          if (err){
              callback(err, err.stack);
          }else{
              callback(null, data);
          }
      });

    }

    createQueue(params) {

        du.debug('Create Queue', params);

        return new Promise((resolve, reject) => {

            du.highlight(params);

            this.sqs.createQueue(params, (error, data) => {
                if (error){

                    du.error('Failed to create queue.', error);

                    return reject(error);
                }else{
                    du.debug('Queue created successfully.');

                    return resolve(data);
                }
            });
        });

    }

    setQueueAttibutes(params) {

        du.debug('Set Queue Attrbutes', params);

        return new Promise((resolve, reject) => {

            this.sqs.setQueueAttributes(params, (error, data) => {
                if (error){

                    du.error('Failed to set queue attributes.', error);

                    return reject(error);
                }else{
                    du.debug('Queue attributes set successfully.');

                    return resolve(data);
                }
            });
        });

    }

    queueExists(shortname, refresh){

      du.debug('Queue Exists');

      if(!_.has(this, 'existing_queues') || (!_.isUndefined(refresh) && refresh == true)){

        return this.listQueues().then((queues) => {

          if(!_.has(queues, 'QueueUrls')){
            return [];
          }

          if(!_.isArray(queues.QueueUrls)){
            return Promise.reject(eu.getError('server', 'Unexpected response format from AWS ListQueues.'));
          }

          let existing_queues = queues.QueueUrls.map(queue_url  => {
            return queue_url.substr((queue_url.lastIndexOf('/')+1), queue_url.length);
          });

          this.existing_queues = existing_queues;

          return (_.contains(this.existing_queues, shortname));

        });

      }else{

        return Promise.resolve((_.contains(this.existing_queues, shortname)));

      }


    }

    listQueues(params){

      du.debug('List Queues');

      return new Promise((resolve, reject) => {

        if(_.isUndefined(params) || !_.isObject(params)){
          params = {};
        }

        this.sqs.listQueues(params, function(error, data) {

          if (error){ return reject(eu.getError('server', error.message));}

          return resolve(data);

        });

      });

    }

    deleteQueue(shortname) {

      du.debug('Delete Queue');

      du.warning('Deleting queue: '+shortname);

      return this.queueExists(shortname).then(queue_exists => {

        if(queue_exists){

          let queue_url = this.getQueueURL(shortname);

          let parameters = {QueueUrl: queue_url};

          this.sqs.deleteQueue(parameters, (error, data) => {

            if (error){

              if (error.code === 'AWS.SimpleQueueService.NonExistentQueue') {

                du.warning('Failed to delete queue (does not exist): '+shortname);

                return false;

              }

              return eu.getError('server', 'Failed to delete queue: '+shortname);

            }else{

              du.debug(shortname+' queue successfully deleted.');

              return data;

            }

          });

        }else{

          du.warning('Queue does not exist: '+shortname);

          return false;

        }

      });

    }

}

var sqs = new SQSUtilities(process.env.stage);

module.exports = sqs;
