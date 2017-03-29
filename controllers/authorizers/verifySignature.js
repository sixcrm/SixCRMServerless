'use strict'
const _ = require("underscore");

var timestamp = require('../../lib/timestamp.js');
var signature = require('../../lib/signature.js');

var userController = require('../../controllers/User.js');

class verifySignatureController {
	
	execute(event){
		
		return this.parseEventSignature(event)
			.then(this.createTokenObject)
			.then(this.verifyTimestamp)
			.then((event) => this.verifySignature(event));
			
	}
	
 	parseEventSignature(event){
 		
 		return new Promise((resolve, reject) => {
 			
 			var tokens = event.authorizationToken.split(':');
 			
 			if(!_.isArray(tokens) || !(tokens.length == 3)){ return reject(false); }
 			
 			resolve(tokens);
 			
 		});
 		
 	}
 	
 	createTokenObject(tokens){
 		
 		return Promise.resolve({
            access_key: tokens[0],
            timestamp: tokens[1],
            signature: tokens[2]
        });
 		
 	}
	
	verifyTimestamp(token_object){
		
		return new Promise((resolve, reject) => {
		
			var time_difference = timestamp.getTimeDifference(token_object.timestamp);
			
			if(time_difference > (60 * 60 * 5)){ return reject(false); }
			
			resolve(token_object);
		
		});
				
	}
	
	//Technical Debt:  This is hard to test!
	verifySignature(token_object){
		
		return new Promise((resolve, reject) => {
			
			if(!signature.validateSignature(access_key.secret_key, token_object.timestamp, token_object.signature)){ 
							
					return reject(false); 
					
			}
			
			userController.disableACLs();
					
			return userController.getUserByAccessKeyId(access_key.id).then((user) => {
				
				userController.enableACLs();
				
				return resolve(user);
			
			});

		});
		
	}
	
}

module.exports = new verifySignatureController();

