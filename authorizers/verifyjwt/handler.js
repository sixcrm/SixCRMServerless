'use strict';
const _ = require("underscore");
const jwt = require('jsonwebtoken');

module.exports.verifyjwt = (event, context, callback) => {
	
	if(process.env.stage != 'production'){
		
		if(event.authorizationToken == process.env.development_bypass){
			
			return callback(null, generatePolicy('user', 'Allow', event.methodArn));
			
		}	
		
	}
	
	validateJWT(event.authorizationToken, (error, data) => {
		
		if(!_.isError(error) && _.isString(data)){
			
			switch (data.toLowerCase()) {
				case 'allow':
					return callback(null, generatePolicy('user', 'Allow', event.methodArn));
					break;
				
			}
		}
		
		return callback(null, generatePolicy('user', 'Deny', event.methodArn));
		
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
    
    authResponse.context = {};
    return authResponse;
}
