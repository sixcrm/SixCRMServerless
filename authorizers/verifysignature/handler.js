'use strict';
const _ = require("underscore");
var AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});
const crypto = require('crypto');

var timestamp = require('../../lib/timestamp.js');
var signature = require('../../lib/signature.js');
var policy_response = require('../../lib/policy_response.js');

var accessKeyController = require('../../controllers/AccessKey.js');
var userController = require('../../controllers/User.js');

module.exports.verifysignature = (event, context, callback) => {

	var token = event.authorizationToken.split(':');
	

	if(_.isArray(token) && token.length == 3){

		var time_difference = timestamp.getTimeDifference(Math.floor(token[1]/1000));
		
		if(time_difference > (60 * 60 * 5)){

			callback(null, policy_response.generatePolicy('user', 'Deny', event.methodArn, null));
			
		}
	
		accessKeyController.getAccessKey(token[0]).then((access_key) => {

			if(!_.isObject(access_key) || !_.has(access_key, 'secret_key')){
				
				throw new Error('Unexpected response from DynamoDB');
				
			}
			
			var correct_signature = signature.createSignature(access_key.secret_key, token[1]);
				
			if(token[2] == correct_signature){

				userController.getUserByAccessKeyId(access_key.id).then((user) => {

					callback(null, policy_response.generatePolicy('user', 'Allow', event.methodArn, user.id));
					
				}).catch((error) => {

					callback(null, policy_response.generatePolicy('user', 'Deny', event.methodArn, null));
					
				});
				
			}else{

				callback(null, policy_response.generatePolicy('user', 'Deny', event.methodArn, null));
				
			}		

		}).catch((error) => {
		
			throw error;
			
		});
		
	}
		
};
