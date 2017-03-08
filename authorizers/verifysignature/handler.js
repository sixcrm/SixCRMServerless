'use strict';
/*
* Technical Debt:  Because we are now using JWTs, and because we can generate signatures on the backend, do we really need to verify the signature any longer?
*/

const _ = require("underscore");

var policy_response = require('../../lib/policy_response.js');

var verifySignatureController = require('../../controllers/authorizers/verifySignature.js');

module.exports.verifysignature = (event, context, callback) => {
	
	verifySignatureController.execute(event).then((user) => {
		
		if(_.isObject(user) && _.has(user, 'id')){
			return callback(null, policy_response.generatePolicy('user', 'Allow', event.methodArn, user.id));
		}else{
			return callback(null, policy_response.generatePolicy('user', 'Deny', event.methodArn, null));
		}
		
	}).catch((error) =>{
	
		return callback(null, policy_response.generatePolicy('user', 'Deny', event.methodArn, null));
		
	});

};