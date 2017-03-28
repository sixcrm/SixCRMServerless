'use strict'
const AWS = require("aws-sdk");
const du = require('./debug-utilities.js');

class LambdaUtilities {
	
	constructor(stage){
		
		var parameters = {apiVersion: '2015-03-31', region: 'us-east-1'};
		
		if(stage == 'local'){
			
			parameters.region = 'us-east-1';
			parameters.endpoint = process.env.lambda_endpoint;

		}

		if (process.env.require_local) {
			this.requireLocal = true;
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
		
			// Technical Debt:  Refactor this portion to work with the Promise structure.
			// Make sure local functions can still be executed, for example:
			// `export SIX_VERBOSE=2; export AWS_PROFILE=six; serverless invoke local -f indextoarchive --stage local`
			if (this.requireLocal) {

				// We want to execute the lambda function locally instead of executing on AWS infrastructure.
				// First we need to determine the path to the handler.
				let handlerPath = '../workers/' + parameters.function_name + '/handler';
				let handler = require(handlerPath);

				// Next we ned to determine the name of the function to execute.
				let functionName = parameters.function_name;

				// Parameters of every lambda are:
				// 1. serialized event,
				// 2. context,
				// 3. callback to execute with the response
				let serializedPayload = JSON.parse(params.Payload);
				let context = {}; // local execution, empty context seems OK
				let lambdaCallback = (error, data) => {
                    if (error) {
                        return reject(error);
                    }

                    // AWS Lambda JS SKD does this for us, but when executing locally we need to wrap the response into
					// an object ourselves and execute the main callback manually.
                    return resolve(callback(null, {
                        StatusCode: 200, // we're in the resolve block, so obviously the function executed correctly
                        Payload: data    // payload is the data returned by the function
                    }));
                };

				// Finally, we execute the function.
				handler[functionName](serializedPayload, context, lambdaCallback);
				
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