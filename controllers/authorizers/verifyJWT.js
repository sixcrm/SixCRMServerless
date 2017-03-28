'use strict'
const _ = require("underscore");
const jwt = require("jsonwebtoken");
const du = require('../../lib/debug-utilities.js');

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
			
			du.debug('Token: '+token, 'Secret: '+process.env.secret_key);
			
			jwt.verify(token, process.env.secret_key, function(error, decoded) {
				
				du.debug('Decoded', decoded);	
				
				if(_.isError(error) || !_.isObject(decoded)){
					
					du.warning(error);
					
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
					
				if(_.has(decoded_token, 'email')){
					return resolve(decoded_token.email);
				}
				
				return resolve(false);
				
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