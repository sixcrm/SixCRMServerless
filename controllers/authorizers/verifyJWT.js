'use strict'
const _ = require("underscore");
const jwt = require("jsonwebtoken");

var timestamp = require('../../lib/timestamp.js');
const du = require('../../lib/debug-utilities.js');

var userController = require('../../controllers/User.js');

class verifyJWTController {
	
	constructor(){
		this.messages = {
			bypass: 'BYPASS'
		}
	}
	
	execute(event){
		
		return this.acquireToken(event).then((token) => this.verifyJWT(token));
			
	}
	
	acquireToken(event){
		
		du.debug('Acquire Token');
		
		return new Promise((resolve, reject) => {
		
			if(_.has(event, 'authorizationToken')){
				
				return resolve(event.authorizationToken);
					
			}
		
			return reject(false);
			
		});
		
	}
	
	validateToken(token){
		
		du.debug('Validate Token');
		
		return new Promise((resolve, reject) => {
			
			if(!_.has(process.env, 'secret_key')){ return resolve(false); }
			
			jwt.verify(token, process.env.secret_key, function(error, decoded) {
				
				du.debug('Decoded', decoded);	
				
				if(_.isError(error) || !_.isObject(decoded)){
		
					return resolve(false);
			
				}
					
				return resolve(decoded);
			
			});
			
		});
	}
	
	verifyJWT(token){
		
		return new Promise((resolve, reject) => {
			
			if(this.developmentBypass(token) == true){
				
				return resolve(this.messages.bypass);
				
			}
			
			du.debug('Token:', token);
			 
			this.validateToken(token).then((decoded_token) => {
			
				if(decoded_token == false){ return resolve(false); }
				
				du.debug('Decoded Token:', decoded_token);
				
				if(_.has(decoded_token, 'user_id')){
					
					global.disableactionchecks = true;
					
					du.debug('Decoded Token: ', decoded_token);
					
					userController.get(decoded_token.user_id).then((user) => {
						
						global.disableactionchecks = false;
						
						if(_.isObject(user) && _.has(user, 'id')){
							
							return resolve(user);
							
						}
						
						return resolve(false);
						
					});
					
				}else if(_.has(decoded_token, 'email')){
					
					global.disableactionchecks = true;
					
					userController.getUserByEmail(decoded_token.email).then((user) => {
					
						global.disableactionchecks = false;
						
						if(_.isObject(user) && _.has(user, 'id')){
							
							return resolve(user);
							
						}
						
						return resolve(decoded_token.email);
						
					});
					
				}else{
					
					return resolve(false);
					
				}
					
				
			}).catch((error) =>{
				return reject(error);
			});

		});
		
	}
	
	developmentBypass(token){
		
		if(_.has(process.env, 'stage') && _.contains(['local', 'development'], process.env.stage)){
			
			if(_.has(process.env, 'development_bypass') && token == process.env.development_bypass){
				
				return true;
				
			}
			
		}
		
		return false;
		
	}
	
}

module.exports = new verifyJWTController();