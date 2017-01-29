'use strict';
var AWS = require("aws-sdk");
const _ = require("underscore");

var lr = require('../../lib/lambda-response.js');
var sqs = require('../../lib/sqs-utilities.js');

module.exports.billtohold = (event, context, callback) => {
	
	sqs.receiveMessages({queue_url: process.env.bill_queue_url, limit: 10}, (error, data) => {
		
		if(_.isError(error)){
			lr.issueError(error, 500, event, error, callback);			
		};
					
		if (data && data.length > 0) {
		
            data.forEach(function(message) {
            	
            	//asynchronously execute the worker lambda
            	//console.log(message);
            	//send to bill queue worker
				
				//success_condition
				if(true){
			
					sqs.sendMessage({message_body: message.Body, queue_url: process.env.hold_queue_url}, (error, data) => {
					
						if(_.isError(error)){
							lr.issueError(error, 500, event, error, callback);
						}
					
						sqs.deleteMessage({queue_url: process.env.bill_queue_url, receipt_handle: message.ReceiptHandle}, (error, data) => {
						
							if(_.isError(error)){
								lr.issueError(error, 500, event, error, callback);
							}	
						
							lr.issueResponse(200, {
								message: 'Success'
							}, callback);
		
						});	
					
					});
					
				}else{
					
					var error = new Error('Unable to process billing.');
					lr.issueError(error, 500, event, error, callback);
					
				}
            
            });
    
        }else{
        	
        	lr.issueResponse(200, {
				message: 'No messages in queue: '+process.env.bill_queue_url
			}, callback);
						
        }
			
	});

}