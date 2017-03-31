'use strict';
var policy_response = require('../../lib/policy_response.js');

var verifyTransactionJWTController = require('../../controllers/authorizers/verifyTransactionJWT.js');

/*
* Note:  This authorizer serves two purposes:  Verify User JWTs (admin access) and Verify Transaction JWTs (customer transaction validation).
*/

module.exports.verifyjwt = (event, context, callback) => {
	
	verifyTransactionJWTController.execute(event).then((response) => {
		
		if(response !== true){ return callback(null, policy_response.generatePolicy('user', 'Deny', event.methodArn, null)); }
		
		return callback(null, policy_response.generatePolicy('user', 'Allow', event.methodArn, null));
		
	}).catch(() =>{
		
		return callback(null, policy_response.generatePolicy('user', 'Deny', event.methodArn, null));
		
	});

};