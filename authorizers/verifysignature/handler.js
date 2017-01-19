'use strict';
const _ = require("underscore");
var AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});
const crypto = require('crypto');
var accessKeyController = require('../../controllers/AccessKey.js');
var timestamp = require('../../lib/timestamp.js');
var signature = require('../../lib/signature.js');
var policy_response = require('../../lib/policy_response.js');

module.exports.verifysignature = (event, context, callback) => {
	
	validateToken(event.authorizationToken, (error, data) => {

		if(!_.isError(error) && _.isString(data)){
			
			switch (data.toLowerCase()) {
				case 'allow':
					callback(null, policy_response.generatePolicy('user', 'Allow', event.methodArn));
					break;
				
			}
		}
		
		callback(null, policy_response.generatePolicy('user', 'Deny', event.methodArn));
		
	});
		
};

var validateToken = function(token, callback){

	token = token.split(':');
	
	if(_.isArray(token) && token.length == 3){
		
		if(!isRecentRequest(token[1])){
			callback(null, 'deny');
		}
		
		retrieveSecretByAccessKey(token[0], (error, secret_key) => {
			
			if(_.isError(error)){
				callback(error, null);
			}
			if(_.isString(secret_key)){			
				
				var correct_signature = signature.createSignature(secret_key, token[1]);
					
				if(token[2] == correct_signature){
					
					callback(null, 'allow');
					
				}		
				
			}
		
			callback(null, 'deny');
		
		});
		
	}else{
		
		callback(new Error('Unrecognized Authorization format.'), null);
		
	}
	
}

var isRecentRequest = function(request_time){
	var current_time = timestamp.createTimestampMicroSeconds();
	if(current_time - request_time > (60 * 5 * 1000)){//this value should be configured
		return false;
	}
	return true;
}

var retrieveSecretByAccessKey = function(access_key, callback){
	
	accessKeyController
		.getAccessKey(access_key)
		.then((data) => {
			if(!_.isObject(data) || !_.has(data,'secret_key')){
				callback(new Error('Unexpected response from DynamoDB'), null);
			}
			callback(null, data.secret_key);
		})
		.catch((error) => {
			if (_.isError(error)) {	
				callback(error, null);
		 	}
		});

}

