'use strict';
const _ = require("underscore");
const validator = require('validator');

var policy_response = require('../../lib/policy_response.js');

var verifyJWTController = require('../../controllers/authorizers/verifyJWT.js');

module.exports.verifyjwt = (event, context, callback) => {
	
	verifyJWTController.execute(event).then((user) => {
		
		if(_.isObject(user) && _.has(user, 'id')){ return callback(null, policy_response.generatePolicy('user', 'Allow', event.methodArn, user.id)); }
		
		if(validator.isEmail(user)){ return callback(null, policy_response.generatePolicy('user', 'Allow', event.methodArn, user)); }
		
		if(user == verifyJWTController.messages.bypass){ return callback(null, policy_response.generatePolicy('user', 'Allow', event.methodArn, null)); }
				
		return callback(null, policy_response.generatePolicy('user', 'Deny', event.methodArn, null));
		
	}).catch((error) =>{
		
		return callback(null, policy_response.generatePolicy('user', 'Deny', event.methodArn, null));
		
	});

};