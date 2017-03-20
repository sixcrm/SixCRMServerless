'use strict'
const AWS = require("aws-sdk");
const _ = require('underscore');
var LambdaResponse = require('./lambda-response.js');
const du = require('./debug-utilities.js');

class LambdaUtilities {
	
	constructor(stage){
		
		var parameters = {apiVersion: '2015-03-31', region: 'us-east-1'};
		
		if(stage == 'local'){
			
			parameters.region = 'us-east-1';
			parameters.endpoint = process.env.lambda_endpoint;

			this.isLocal = true;
					
		}

		this.lambda = new AWS.Lambda(parameters);
		
	}
	
	invokeFunction(parameters, callback){
		
		return new Promise((resolve, reject) => {
		
			du.warning(parameters);
			
			var params = {
				FunctionName: parameters.function_name,
				Payload: parameters.payload, 
				InvocationType: 'RequestResponse',
				LogType: 'Tail'
			};
		
			//Technical Debt:  this is preventing local usage of a function that uses this method
			//Technical Debt:  Refactor this portion to work with the Promise structure
			//example: `export SIX_VERBOSE=2; export AWS_PROFILE=six; serverless invoke local -f indextoarchive --stage local` 
			if (false && this.isLocal) {
				let functionName = '../workers/' + parameters.function_name + '/handler';
				let func = require(functionName);

				func[parameters.function_name](JSON.parse(params.Payload), {}, (error, data) => {
					callback(null, {
						StatusCode: 200,
						Payload: data
					});
				});
				
			} else {
			
				this.lambda.invoke(params, function (error, data) {
					
					if (error) {
						return reject(error);
					}
					
					return resolve(data);

				});
				
			}
		
		});
		
	}
	
}

var lambda = new LambdaUtilities(process.env.stage);
module.exports = lambda;