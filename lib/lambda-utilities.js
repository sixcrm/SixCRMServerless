'use strict'
const AWS = require("aws-sdk");
const _ = require('underscore');

class LambdaUtilities {
	
	constructor(stage){
		
		this.lambda = new AWS.Lambda({apiVersion: '2015-03-31', region: 'us-east-1'});

	}
	
	invokeFunction(parameters, callback){
		var params = {
			FunctionName: parameters.function_name,
			Payload: parameters.payload, 
			InvocationType: 'RequestResponse',
			LogType: 'Tail'
		};
		
		this.lambda.invoke(params, function(error, data) {
			if (error){
				//console.log(error, error.stack);
				callback(error, error.stack);
			}else{
				callback(null, data);
			}
			
		});
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