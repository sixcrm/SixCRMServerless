'use strict'
const AWS = require("aws-sdk");
const _ = require('underscore');
const du = global.routes.include('lib', 'debug-utilities.js');
//Technical Debt:  These should all be converted to Promises.

class SQSUtilities {

    constructor(){

        this.sqs = new AWS.SQS({region: 'us-east-1'});

    }

    receiveMessages(parameters) {

        return new Promise((resolve, reject) => {

            let params = {};

            if(_.has(parameters, 'queue_url')){
                params['QueueUrl'] = parameters['queue_url'];
            }

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

                if(_.has(parameters, 'queue_url')){ params['QueueUrl'] = parameters.queue_url; }

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

        var params = {
            QueueUrl: parameters.queue_url,
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

        var params = {
            MessageBody: parameters.message_body,
            QueueUrl: parameters.queue_url,
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

        var params = {
            QueueUrl: parameters.queue_url
        };

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

    deleteQueue(queue_url) {

        du.debug('Delete Queue', queue_url);

        let params = {
            QueueUrl: queue_url
        };

        return new Promise((resolve, reject) => {

            this.sqs.deleteQueue(params, (error, data) => {
                if (error){

                    du.error('Failed to delete queue.', error);

                    // If the queue does not exist don't reject. Technical Debt: should this be configurable?
                    if (error.code === 'AWS.SimpleQueueService.NonExistentQueue') {
                        return resolve();
                    }

                    return reject(error);
                }else{
                    du.debug('Queue deleted successfully.');

                    return resolve(data);
                }
            });
        });

    }

}

var sqs = new SQSUtilities(process.env.stage);

module.exports = sqs;
