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
				let functionPath = '../workers/' + parameters.function_name + '/handler';
				let func = require(functionPath);

				func[parameters.function_name](JSON.parse(params.Payload), {}, (error, data) => {
                    if (error) {
                        return reject(error);
                    }

                    return resolve(callback(null, {
                        StatusCode: 200,
                        Payload: data
                    }));
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