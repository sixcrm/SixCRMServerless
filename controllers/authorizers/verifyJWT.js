'use strict'
const _ = require("underscore");
const jwt = require("jsonwebtoken");

var timestamp = require('../../lib/timestamp.js');
var array_utilities = require('../../lib/array-utilities.js');

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
		
		return new Promise((resolve, reject) => {
		
			if(_.has(event, 'authorizationToken')){
				
				return resolve(event.authorizationToken);
					
			}
		
			return reject(false);
			
		});
		
	}
	
	validateToken(token){
		
		return new Promise((resolve, reject) => {
			
			if(!_.has(process.env, 'secret_key')){ return resolve(false); }
			
			jwt.verify(token, process.env.secret_key, function(error, decoded) {
				
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
			
			this.validateToken(token).then((decoded_token) => {
				
				if(decoded_token == false){ return resolve(false); }
				
				if(_.has(decoded_token, 'user_id')){
					
					userController.get(decoded_token.user_id).then((user) => {
						
						if(_.isObject(user) && _.has(user, 'id')){
							
							return resolve(user);
							
						}
						
						return resolve(false);
						
					});
					
				}else{
					
					return resolve(false);
					
				}
					
				
			});

		});
		
	}
	
	developmentBypass(token){
		
		if(_.has(process.env, 'stage') && array_utilities.inArray(process.env.stage, ['local', 'development'])){
			
			if(_.has(process.env, 'development_bypass') && token == process.env.development_bypass){
				
				return true;
				
			}
			
		}
		
		return false;
		
	}
	
}

module.exports = new verifyJWTController();