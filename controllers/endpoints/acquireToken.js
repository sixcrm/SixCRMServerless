'use strict';
const jwt = require('jsonwebtoken');
const _ = require("underscore");

var timestamp = require('../../lib/timestamp.js');
var endpointController = require('../../controllers/endpoints/endpoint.js');

class acquireTokenController extends endpointController {
	
	constructor(){
		super();
	}
	
	execute(event){
		
		return this.preprocessing(event)
			.then(this.validateInput)
			.then(this.acquireToken);
		
	}	
	
	validateInput(event){
		
		return new Promise((resolve) => {
			
			//Technical Debt:  Why is there a user object here?
			if(_.has(event, "requestContext") && _.has(event.requestContext, "authorizer") && _.has(event.requestContext.authorizer, "user")){
			
				resolve(event);
				
			}else{
			
				throw new Error('Unset user object in the JWT.');
				
			}

			resolve(event);
			
			
		});
		
	}
	
	acquireToken (event) {
		
		//Technical Debt:  why is this here?  We only want user JWT's for the graph endpoint...
		var user_id = event.requestContext.authorizer.user;

		var _timestamp = timestamp.createTimestampSeconds() + (60 * 60);

		var payload = {
			iat: _timestamp,
			exp: _timestamp,
			user_id: user_id
		}
	
		return jwt.sign(payload, process.env.site_secret_jwt_key);
				
	}
	
}

module.exports = new acquireTokenController();

/*
console.log(event.requestContext.authorizer.user);
	
	var user_id = event.requestContext.authorizer.user;
	
	var _timestamp = timestamp.createTimestampSeconds() + (60 * 60);

	var payload = {
		iat: _timestamp,
		exp: _timestamp,
		user_id: user_id
	}
	
	var created_token = jwt.sign(payload, process.env.site_secret_jwt_key);
	
	lr.issueResponse(200, {
		message: 'Success',
		token: created_token
	}, callback);
*/
