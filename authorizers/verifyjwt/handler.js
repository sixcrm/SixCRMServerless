'use strict';
const _ = require("underscore");
const jwt = require('jsonwebtoken');
var policy_response = require('../../lib/policy_response.js');

module.exports.verifyjwt = (event, context, callback) => {
	
	if(process.env.stage != 'production'){
		
		if(event.authorizationToken == process.env.development_bypass){
			
			return callback(null, policy_response.generatePolicy('user', 'Allow', event.methodArn));
			
		}	
		
	}
	
	validateJWT(event.authorizationToken, (error, data) => {
		
		if(!_.isError(error) && _.isString(data)){
			
			switch (data.toLowerCase()) {
				case 'allow':
					return callback(null, policy_response.generatePolicy('user', 'Allow', event.methodArn));
					break;
				
			}
		}
		
		return callback(null, policy_response.generatePolicy('user', 'Deny', event.methodArn));
		
	});
		
};

var validateJWT = function(token, callback){

	jwt.verify(token, process.env.secret_key, function(err, decoded) {	
		
		if(_.isError(err) || !_.isObject(decoded)){
			callback(null, 'deny');			
		}
		
		callback(null, 'allow');

	});
	
}
