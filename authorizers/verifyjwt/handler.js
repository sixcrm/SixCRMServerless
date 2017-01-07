'use strict';
const _ = require("underscore");
const jwt = require('jsonwebtoken');

module.exports.verifyjwt = (event, context, callback) => {
	
	validateJWT(event.authorizationToken, (error, data) => {
		
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
	
	return 'allow';
	/*
	jwt.verify(duplicate_body['token'], process.env.user_secret_key, function(err, decoded) {
			
		if(err){
			
			var error_response = {'validation_errors':['Could not verify user token.  Please contact the system administrator.']};		
	
			lambda_response['body'] = JSON.stringify({
				message: 'One or more validation errors occurred.',
				input: event,
				errors: error_response
			});

			callback(null, lambda_response);
			
		}
	});
	*/
	
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
