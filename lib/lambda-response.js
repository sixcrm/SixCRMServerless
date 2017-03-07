'use strict';
const _ = require('underscore');

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
		let body = {message: message};
		
		
		if(_.isObject('message') && _.has(message, 'message')){
			body.message = message.message;
		}

		if(!_.has(body, 'message')) {
			body.message = 'An unexpected error occurred.';
		}
		
		if(_.has(error, 'issues')){
			body.issues = error.issues;
		}

		return this.issueResponse(code, body, callback);
/*
		this.issueResponse(code, {
			message: message,
			event: event,
			error: error.message
		}, callback);
*/
	}

	issueResponse(code, body, callback)	{

		if (code) {
			this.lambda_response.statusCode = code;
		}
		if (body) {
			this.lambda_response.body = JSON.stringify(body);
		}

		return callback(null, this.lambda_response)
	}

}

module.exports = LambdaResponse;
