'use strict';
const _ = require("underscore");
const jwt = require('jsonwebtoken');

var policy_response = require('../../lib/policy_response.js');

var userController = require('../../controllers/User.js');

module.exports.verifyjwt = (event, context, callback) => {
	
	var token = event.authorizationToken;
	
	if(process.env.stage != 'production'){
		
		if(token == process.env.development_bypass){
			
			//might need to set the test user here...
			return callback(null, policy_response.generatePolicy('user', 'Allow', event.methodArn, null));
			
		}	
		
	}
	
	jwt.verify(token, process.env.secret_key, function(error, decoded) {	
		
		if(_.isError(error) || !_.isObject(decoded)){
		
			return callback(null, policy_response.generatePolicy('user', 'Deny', event.methodArn, null));			
			
		}
		
		var user_id = decoded.user_id;
		
		userController.getUser(user_id).then((user) => {
			//check to make sure that the user is active			
			console.log(user);
			return callback(null, policy_response.generatePolicy('user', 'Allow', event.methodArn, user.id));
			
		}).catch((error) => {
			console.log(error);
			return callback(null, policy_response.generatePolicy('user', 'Deny', event.methodArn, null));
			
		});

	});
		
};

