'use strict'
const AWS = require("aws-sdk");
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const parserutilities = global.SixCRM.routes.include('lib', 'parser-utilities.js');
const AWSUtilities = global.SixCRM.routes.include('lib', 'aws-utilities.js');

class SQSUtilities extends AWSUtilities {

    constructor(){
      super();

      this.localhost_endpoint = 'http://localhost:9324';

      if (process.env.stage !== 'local') {
          this.sqs = new AWS.SQS({
              region: global.SixCRM.configuration.site_config.aws.region
          });
      } else {
          this.sqs = new AWS.SQS({
              region: 'localhost',
              endpoint: this.localhost_endpoint
          });
      }

      this.deadletter_postfix = '_deadletter';

      this.queue_url_template = 'https://sqs.{{region}}.amazonaws.com/{{account}}/{{queue_name}}';

      this.queue_arn_template = 'arn:aws:sqs:{{region}}:{{account}}:{{queue_name}}';

    }

    getQueueARN(queue_name){

      du.debug('Get Queue ARN');

      if(_.isObject(queue_name)){
        if(_.has(queue_name, 'QueueName')){
          queue_name = queue_name.QueueName;
        }else{
          eu.throwError('server', 'Missing QueueName property');
        }
      }

      if(!_.isString(queue_name)){
        eu.throwError('server', 'Improper argumentation for getQueueARN');
      }

      if (process.env.stage === 'local') {
        return queue_name;
      }

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

      if (process.env.stage === 'local') {
          return this.localhost_endpoint + '/queue/' + queue_name;
      }

      let parameters = this.getQueueParameters(queue_name);

      return parserutilities.parse(this.queue_url_template, parameters);

    }

    getQueueParameters(queue_name){

      du.debug('Get Queue Parameters');

      if(_.isNull(queue_name) || _.isUndefined(queue_name)){
        eu.throwError('server', 'Unable to determine queue name.');
      }

      let parameters = {
        'region': global.SixCRM.configuration.site_config.aws.region,
        'account': global.SixCRM.configuration.site_config.aws.account,
        'queue_name': queue_name
      };

      return parameters;

    }

    receiveMessages(parameters) {

        du.debug('Receive Messages', parameters);

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

    deleteMessage(parameters){

      du.debug('Delete Message');

      return new Promise((resolve) => {

          let queue_url = this.getQueueURL(parameters);

          var params = {
              QueueUrl: queue_url,
              ReceiptHandle: parameters.receipt_handle
          };

          this.sqs.deleteMessage(params, (error, data) => {
              return resolve(this.AWSCallback(error, data))
          });

      });

    }

    sendMessage(parameters){

      du.debug('Send Message');

      return new Promise((resolve) => {

        let queue_url = this.getQueueURL(parameters);

        var params = {
          MessageBody: this.ensureString(parameters.message_body),
          QueueUrl: queue_url,
          DelaySeconds: 30,
        };

        du.debug('Sending message', params);

        this.sqs.sendMessage(params, (error, data) => {
          resolve(this.AWSCallback(error, data))
        });

      });

    }

    purgeQueue(parameters){

      du.debug('Purge Queue');

      return new Promise((resolve) => {

        let queue_name;

        if(_.isString(parameters)){

          queue_name = parameters;

        }else{

          if(!_.has(parameters, 'QueueName')){
            eu.throwError('server', 'Purge Queue parameters objects assumed to have QueueName property');
          }

          queue_name = parameters.QueueName;

        }

        this.queueExists(queue_name).then(queue_exists => {

          if(queue_exists){

            du.debug('Queue exists, purging');

            let queue_url = this.getQueueURL(parameters);

            var params = {QueueUrl: queue_url};

            this.sqs.purgeQueue(params, (error, data) => {

              du.highlight(queue_name+' queue purged');

              resolve(this.AWSCallback(error, data))

            });

          }else{

            du.debug('Queue not found, skipping');

            return resolve(false);

          }

        });

      });

    }

    createQueue(params) {

      du.debug('Create Queue', params);

      return new Promise((resolve, reject) => {

        du.warning(params.QueueName);

        this.queueExists(params.QueueName).then(queue_exists => {

          if(queue_exists){

            du.highlight('Queue exists, skipping');

            return resolve(false);

          }else{

            du.highlight('Queue not found, creating', params);

            this.sqs.createQueue(params, (error, data) => {
              return resolve(this.AWSCallback(error, data));
            });

          }

        });

      });

    }

    setQueueAttibutes(params) {

      du.debug('Set Queue Attrbutes', params);

      return new Promise((resolve, reject) => {

        this.sqs.setQueueAttributes(params, (error, data) => resolve(this.AWSCallback(error, data)));

      });

    }

    queueExists(shortname, refresh){

      du.debug('Queue Exists');

      if(_.isUndefined(refresh)){
        refresh = false;
      }

      if(!_.has(this, 'existing_queues') || refresh == true){

        return this.listQueues().then((queues) => {

          du.info(queues);
          if(!_.has(queues, 'QueueUrls')){

            this.existing_queues = [];

            return Promise.resolve(false);

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

      return this.queueExists(shortname, true).then(queue_exists => {

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

    ensureString(value) {
        if (_.isString(value)) {
            return value;
        }

        return JSON.stringify(value);
    }

}

module.exports = new SQSUtilities();
