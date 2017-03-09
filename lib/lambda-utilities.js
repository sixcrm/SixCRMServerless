'use strict'
const AWS = require("aws-sdk");
const _ = require('underscore');
var LambdaResponse = require('./lambda-response.js');

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
		var params = {
			FunctionName: parameters.function_name,
			Payload: parameters.payload, 
			InvocationType: 'RequestResponse',
			LogType: 'Tail'
		};

        if (this.isLocal) {
			let functionName = '../' + parameters.function_name;
			let func = require(functionName);

			func.execute(JSON.parse(params.Payload)).then(result => {
				callback(null, {
					StatusCode: 200,
					Payload: {
                        statusCode: 200,
                        headers: {
                            "Access-Control-Allow-Origin" : "*"
                        },
                        body: JSON.stringify(result)
                    }
				});
			}).catch(error => {
                callback(error, error.stack);
			});
        } else {
            this.lambda.invoke(params, function (error, data) {
                if (error) {
                    callback(error, error.stack);
                } else {
                    callback(null, data);
                }
            });
        }
	}
	
	invokeFunctionAsync(parameters, callback){
		var params = {
			ClientContext: parameters.client_context, 
			FunctionName: parameters.function_name,
			InvocationType:'Event' 
		};
		
		this.lambda.invoke(params, function(error, data) {
			if (error){
				console.log(error, error.stack);
				callback(error, error.stack);
			}else{
				callback(null, data);
				/*
				data = {
				FunctionError: "", 
				LogResult: "", 
				Payload: <Binary String>, 
				StatusCode: 123
				}
				*/
			}
			
		});
	}
	
}

var lambda = new LambdaUtilities(process.env.stage);
module.exports = lambda;