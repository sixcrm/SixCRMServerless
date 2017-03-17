'use strict'
const AWS = require("aws-sdk");
const _ = require('underscore');

//Technical Debt:  These should all be converted to Promises.
class SQSUtilities {
	
	constructor(stage){
		
		this.sqs = new AWS.SQS({region: 'us-east-1'});

	}
	
	receiveMessages(parameters, callback) {
		var params = {
			QueueUrl: parameters.queue_url,
			MaxNumberOfMessages: parameters.count
		};
		this.sqs.receiveMessage(params, function(error, data) {
			if (error) {
				console.error(error, error.stack);
				callback(error, error.stack);
			} else {
				callback(null, data.Messages);
			}
		});
	}
	
	deleteMessages(parameters){
	
		return new Promise((resolve, reject) => {
			
			let entries = [];
			
			if(_.has(parameters, 'messages')){
				parameters.messages.forEach((message) => {
					if(_.has(message, 'ReceiptHandle') && _.has(message, 'Id')){
						entries.push({
							Id: message.MessageId,
							ReceiptHandle: message.ReceiptHandle
						});
					}
				});
			}
			
			let params = {
				Entries: entries
			};
			
			if(_.has(parameters, 'queue_url')){
			
				parameters['QueueUrl'] = parameters.queue_url;
				
			}
			
			sqs.deleteMessageBatch(params, function(err, data) {
			
				if (err){ 
					return reject(err)
				}else{     
					return resolve(data);
				}
				
			});
		
		});
		
	}
	
	deleteMessage(parameters, callback){
		
		var params = {
			QueueUrl: parameters.queue_url,
			ReceiptHandle: parameters.receipt_handle
		};
		this.sqs.deleteMessage(params, function(error, data) {
			if(error){ 
				console.log(error, error.stack); 
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
		this.sqs.sendMessage(params, function(error, data) {
			if (error){ 
				console.log(error, error.stack);
				callback(error, error.stack);
			}else{
				callback(null, data);
			}
		});		
		
		
	}
	
}

var sqs = new SQSUtilities(process.env.stage);
module.exports = sqs;