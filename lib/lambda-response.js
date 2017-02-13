'use strict'
var _ =  require('underscore');

class LambdaResponse {
	
	constructor(){
		this.lambda_response = {
			statusCode: 500,
			headers: {
        		"Access-Control-Allow-Origin" : "*"
      		},
			body:'An unexpected error occurred.'
		};	
	
	}
	
	issueError(message, code, event, error, callback){
		
		if(_.isError(message)){
			message = message.message;
		}
		
		if(message == ''){
			message = 'An unexpected error occurred.';
		}
		
		if(_.isError(error)){
			
			this.issueResponse(code, {
				message: message
			}, callback);
			
			/*
			this.issueResponse(code, {
				message: message,
				event: event,
				error: error.message
			}, callback);
			*/
			
			
		}
		
	}
	
	issueResponse(code, body, callback)	{
		
		this.lambda_response.statusCode = code;
		this.lambda_response.body = JSON.stringify(body);
		
		return callback(null, this.lambda_response)
		
	}	
	
}

var lr =  new LambdaResponse;
module.exports = lr;