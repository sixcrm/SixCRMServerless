'use strict';
var AWS = require("aws-sdk");
const _ = require("underscore");

var lr = require('../../lib/lambda-response.js');
var sqs = require('../../lib/sqs-utilities.js');
var lambda = require('../../lib/lambda-utilities.js');

module.exports.forwardmessage = (event, context, callback) => {
	
	//Technical Debt:  This handles a maximum of 10 messages at a time...
	sqs.receiveMessages({queue_url: process.env.origin_queue_url, limit: 10}, (error, messages) => {
		
		if(_.isError(error)){
			lr.issueError(error, 500, event, error, callback);			
		};
					
		if (messages && messages.length > 0) {
		
            messages.forEach(function(message) {
				
				//Technical Debt: in the case of a local context, I want this to invoke a local function...
            	lambda.invokeFunction({function_name: process.env.workerfunction, payload: JSON.stringify(message)}, (error, workerdata) => {
            		
            		if(_.isError(error)){
            			
						lr.issueError(error, 500, event, error, callback);
					
					//Technical Debt:  This is actually a complex object...  
					}else if(workerdata == false){
					
						lr.issueResponse(200, {
							message: 'Success'
						}, callback);
							
            		}else{
						
						console.log(workerdata);
						//note that the workerdata is assumed to be a rebill object...
						sqs.sendMessage({message_body: workerdata, queue_url: process.env.destination_queue_url}, (error, data) => {
				
							if(_.isError(error)){
								lr.issueError(error, 500, event, error, callback);
							}
				
							sqs.deleteMessage({queue_url: process.env.origin_queue_url, receipt_handle: message.ReceiptHandle}, (error, data) => {
					
								if(_.isError(error)){
									lr.issueError(error, 500, event, error, callback);
								}	
					
								lr.issueResponse(200, {
									message: 'Success'
								}, callback);
	
							});	
				
						});
						
					}
				
				});
            
            });
    
        }else{
        	
        	lr.issueResponse(200, {
				message: 'No messages in queue: '+process.env.origin_queue_url
			}, callback);
						
        }
			
	});

}