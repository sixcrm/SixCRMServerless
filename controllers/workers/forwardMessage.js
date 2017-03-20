'use strict';
var _ = require("underscore");
var sqs = require('../../lib/sqs-utilities.js');
var lambda = require('../../lib/lambda-utilities.js');
var du = require('../../lib/debug-utilities.js');

var workerController = require('./worker.js');

/*
*
* This class is complicated.
* The most important thing to note about this class is the following:
* - If the lambda worker function returns a 200 and a response which is JSON
* -- If the JSON has a "forward" object
* --- If the destination queue is configured
* ---- then it'll pass the forward object along
* --- otherwise, it'll just delete the message
* -- If the JSON has a "failed" object
* --- If the failure queue is configured
* ---- Then it'll forward the object to the failure queue
* -- Otherwise, it'll return a success, no-action event
*
*/

class forwardMessageController extends workerController {
	
	constructor(){
		super();
		this.messages = {
			success:'SUCCESS',
			successnoaction:'SUCCESSNOACTION',
			successnomessages:'SUCCESSNOMESSAGES',
			failforward:'FAILFORWARD'
		};
	}
	
	// Techincal Debt: This doesn't require a event.
	execute(event){
		
		return this.forwardMessage();
		
	}	
	
	parseSQSMessage(workerdata_payload){
		
		return new Promise((resolve, reject) => {
		
			if(_.isObject(workerdata_payload)){
				resolve(workerdata_payload);
			}else if(_.isString(workerdata_payload)){
				var message;
				try{
					message = JSON.parse(workerdata_payload);
				}catch(error){
					reject(error);
				}	
				resolve(message);
			}
			
		});
		
	
	}
	
	parseLambdaResponse(lambda_response){
		
		return new Promise((resolve, reject) => {
			
			var parsed_lambda_response;
			
			if(_.isString(lambda_response)){
				try{
					parsed_lambda_response = JSON.parse(lambda_response);
				}catch(error){
					reject(error);
				}
				
				resolve(parsed_lambda_response);
				
			}else{
			
				resolve(lambda_response);
				
			}
			
		});
		
	}	
	
	forwardMessage(){
	
		var controller_instance = this;
		
		return new Promise((resolve, reject) => {
			
			//Technical Debt:  This handles a maximum of 10 messages at a time...
			sqs.receiveMessages({queue_url: process.env.origin_queue_url, limit: 10}).then((messages) => {

				if (messages && messages.length > 0) {
					
					messages.forEach(function(message) {
						
						du.debug('Handling Message:', message);
						
						//Technical Debt: in the case of a local context, I want this to invoke a local function...
						lambda.invokeFunction({function_name: process.env.workerfunction, payload: JSON.stringify(message)}, (error, workerdata) => {
							if(_.isError(error)){
								reject(error);
								return;
							}
							if(workerdata.StatusCode !== 200){ reject(new Error('Non-200 Status Code returned from Lambda invokation.')); }

							controller_instance.parseSQSMessage(workerdata.Payload).then((response) => {
								
								if(!_.has(response, 'statusCode')){
									
									var error_message = ' Worker data object has unrecognized structure.';
									if(_.has(response, 'body')){
										error_message += response.body;
									}
									reject(new Error(error_message)); 
									
								}
								
								if( response.statusCode !== 200){ 
									
									var error_message = 'Non-200 Status Code returned in workerdata object: ';
									if(_.has(response, 'body')){
										error_message += response.body;
									}
									reject(new Error(error_message)); 
									
								}
								
								controller_instance.parseLambdaResponse(response.body).then((response) => {
									
									if(_.has(response, "forward")){
						
										if(_.has(process.env, "destination_queue_url")){
											
											sqs.sendMessage({message_body: response.forward, queue_url: process.env.destination_queue_url}, (error, data) => {
				
												if(_.isError(error)){
													reject(error);
												}
				
												sqs.deleteMessage({queue_url: process.env.origin_queue_url, receipt_handle: message.ReceiptHandle}, (error, data) => {
					
													if(_.isError(error)){ reject(error) }
					
													resolve(controller_instance.messages.success);
	
												});	
				
											});
							
										}else{
							
											sqs.deleteMessage({queue_url: process.env.origin_queue_url, receipt_handle: message.ReceiptHandle}, (error, data) => {
					
												if(_.isError(error)){ reject(error); }
				
												resolve(controller_instance.messages.success);

											});	
								
										}
						
									}else{
										
										if(_.has(process.env, 'failure_queue_url')){
											
											if(_.has(response, "failed")){
											
												sqs.sendMessage({message_body: response.failed, queue_url: process.env.failure_queue_url}, (error, data) => {
				
													if(_.isError(error)){ reject(error); }
				
													sqs.deleteMessage({queue_url: process.env.origin_queue_url, receipt_handle: message.ReceiptHandle}, (error, data) => {
					
														if(_.isError(error)){ reject(error) }
					
														resolve(controller_instance.messages.failforward);
	
													});	
				
												});
												
											}else{
												
												resolve(controller_instance.messages.successnoaction);
												
											}
											
										}else{
											
											resolve(controller_instance.messages.successnoaction);
											
										}
							
									}
									
								});
							
							});
				
						});
			
					});
	
				}else{
			
					resolve(this.messages.successnomessages);
						
				}
			
			}).catch((error) => {
			
				return reject(error);	
					
			});

		});
		
	}

}

module.exports = new forwardMessageController();