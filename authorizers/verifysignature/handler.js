'use strict';
const _ = require("underscore");
var AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});
const crypto = require('crypto');

module.exports.verifysignature = (event, context, callback) => {
	
	validateToken(event.authorizationToken, (error, data) => {
		
		if(!_.isError(error) && _.isString(data)){
		
			switch (data.toLowerCase()) {
				case 'allow':
					callback(null, generatePolicy('user', 'Allow', event.methodArn));
					break;
				
			}
		}
		
		callback(null, generatePolicy('user', 'Deny', event.methodArn));
		
	});
		
};

var validateToken = function(token, callback){

	token = token.split(':');
	
	if(_.isArray(token) && token.length == 3){
		
		if(!isRecentRequest(token[1])){
			callback(null, 'deny');
		}
		
		retrieveSecretByAccessKey(token[0], (error, data) => {
			
			if(_.isError(error)){
				callback(error, null);
			}
			
			if(_.isString(data)){			
			
				var correct_signature = createSignature(data, token[1]);
		
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
	var current_time = new Date().getTime();
	if(current_time - request_time > (60 * 5 * 1000)){
		return false;
	}
	return true;
}

var retrieveSecretByAccessKey = function(access_key, callback){
	
	var params = {
		TableName: process.env.dynamodb_table,
		KeyConditionExpression: 'access_key = :access_keyv',
		ExpressionAttributeValues: {
			':access_keyv': access_key
		}
	};
	
	dynamodb.query(params, function(err, data) {

		if (_.isError(err)) {	
			callback(err, null);
		 }
		
		if(!_.isObject(data) || !_.has(data,'Items') || !_.isArray(data.Items)){
			callback(new Error('Unexpected response from DynamoDB'), null);
		}
		
		if(data.Items.length < 1){
			callback(null, null);
		}
		
		data.Items.forEach(function(item){
			
			if(!_.has(item, "secret_key")){
				callback(new Error('Invalid DynamoDB entry for access_key.'), null);
			}
			
			callback(null, item.secret_key);	
			
		});
		
	});		
}

var createSignature = function(secret, request_time){
	
	var pre_hash = secret+request_time;
	return crypto.createHash('sha1').update(pre_hash).digest('hex');	
	
}

var generatePolicy = function(principalId, effect, resource) {
    var authResponse = {};
    
    authResponse.principalId = principalId;
    if (effect && resource) {
        var policyDocument = {};
        policyDocument.Version = '2012-10-17'; // default version
        policyDocument.Statement = [];
        var statementOne = {};
        statementOne.Action = 'execute-api:Invoke'; // default action
        statementOne.Effect = effect;
        statementOne.Resource = resource;
        policyDocument.Statement[0] = statementOne;
        authResponse.policyDocument = policyDocument;
    }
    
    // Can optionally return a context object of your choosing.
    authResponse.context = {};
    //authResponse.context.stringKey = "stringval";
    //authResponse.context.numberKey = 123;
    //authResponse.context.booleanKey = true;
    return authResponse;
}
