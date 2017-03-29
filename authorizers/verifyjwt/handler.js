'use strict';
const validator = require('validator');

var policy_response = require('../../lib/policy_response.js');

var verifyJWTController = require('../../controllers/authorizers/verifyJWT.js');

module.exports.verifyjwt = (event, context, callback) => {
	
	verifyJWTController.execute(event).then((response) => {
		
		if(validator.isEmail(response)){ return callback(null, policy_response.generatePolicy('user', 'Allow', event.methodArn, response)); }
		
		if(response == verifyJWTController.messages.bypass){ return callback(null, policy_response.generatePolicy('user', 'Allow', event.methodArn, null)); }
				
		return callback(null, policy_response.generatePolicy('user', 'Deny', event.methodArn, null));
		
	}).catch(() =>{
		
		return callback(null, policy_response.generatePolicy('user', 'Deny', event.methodArn, null));
		
	});

};