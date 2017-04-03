'use strict'
const _ = require("underscore");

var timestamp = require('../../lib/timestamp.js');
var signature = require('../../lib/signature.js');
const du = require('../../lib/debug-utilities.js');

var userController = require('../../controllers/User.js');
const accessKeyController = require('../../controllers/AccessKey.js');

class verifySignatureController {
	
	execute(event){
		
		return this.parseEventSignature(event)
			.then(this.createTokenObject)
			.then(this.verifyTimestamp)
			.then(this.verifySignature)
			.then(this.populateAuthorityUser);
			
	}
	
 	parseEventSignature(event){
 		
 		du.debug('Parse Event Signature');
 		
 		return new Promise((resolve, reject) => {
 			
 			var tokens = event.authorizationToken.split(':');
 			
 			if(!_.isArray(tokens) || !(tokens.length == 3)){ return reject(false); }
 			
 			resolve(tokens);
 			
 		});
 		
 	}
 	
 	createTokenObject(tokens){
 		
 		du.debug('Create Token Object');
 		
 		return new Promise((resolve, reject) =>	{
			
			accessKeyController.disableACLs();
			
			accessKeyController.getAccessKeyByKey(tokens[0]).then((access_key) => {
				
				accessKeyController.enableACLs();	
				
				if(_.has(access_key, 'secret_key') && _.has(access_key, 'id')){
				
					let token_object = {
						access_key: access_key,
						timestamp: tokens[1],
						signature: tokens[2]
					};
				
					return resolve(token_object);
				
				}else{
					
					return reject(new Error('Unset Access Key properties.'));
					
				}
			
			}).catch((error) => {
				
				return reject(error);
				
			});
			
		});
 		
 	}
 	
	
	verifyTimestamp(token_object){
		
		du.debug('Verify Timestamp');
		
		return new Promise((resolve, reject) => {
		
			var time_difference = timestamp.getTimeDifference(token_object.timestamp);
			
			if(time_difference > (60 * 60 * 5)){ 
				
				du.debug('Timestamp Expired');
				
				return reject(false); 
				
			}
			
			return resolve(token_object);
		
		});
				
	}
	
	verifySignature(token_object){
		
		du.debug('Verify Signature');
		
		return new Promise((resolve, reject) => {
			
			if(!signature.validateSignature(token_object.access_key.secret_key, token_object.timestamp, token_object.signature)){ 
					
				du.debug('Failed signature validation');
					
				return reject(false); 
				
			}else{
				
				return resolve(token_object);
				
			}
			
		});
		
	}
	
	populateAuthorityUser(token_object){
	
		du.debug('Populate Authority User');
		
		return new Promise((resolve, reject) => {
					
			userController.disableACLs();

			return userController.getUserByAccessKeyId(token_object.access_key.id).then((user) => {
	
				userController.enableACLs();
	
				return resolve(user);

			}).catch((error) =>{
				
				return reject(error);
				
			});
			
		});
		
	}
	
}

module.exports = new verifySignatureController();

