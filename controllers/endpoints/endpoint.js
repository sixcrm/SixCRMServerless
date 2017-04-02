'use strict';

const _ = require("underscore");
const validator = require('validator');

const du = require('../../lib/debug-utilities.js');
const permissionutilities = require('../../lib/permission-utilities.js');

const userController = require('../User.js');
	
module.exports = class endpointController {
	
	constructor(parameters){
	
		if(_.has(parameters, 'required_permissions')){
		
			this.required_permissions = parameters.required_permissions;
			
		}
	
	}
	
	preprocessing(event){
		
		du.debug('Preprocessing');
		
		/*
		*  This method prepares the transactional endpoints to both validate the request and complete necessary actions
		*/
		
		return this.validateEvent(event)
			.then(this.parseEvent)
			.then(this.acquireAccount)
			.then(this.acquireUser)
			.then(this.validateRequiredPermissions);
	
	}
	
	validateEvent(event){
		
		du.debug('Validate Event');
		
		return new Promise((resolve, reject) => {
			
			du.highlight('Event:', event);
			
			if(!_.has(event, 'requestContext')){
				return reject(new Error('Missing requestContext'));
			}
			
			if(!_.has(event, 'pathParameters')){
				return reject(new Error('Missing pathParameters'));
			}
			
			return resolve(event);
		
		});
		
	}
	
	parseEvent(event){

		du.debug('Parse Event');
		
		return new Promise((resolve, reject) => {
		
			if(!_.isObject(event)){
				
				try{
				
					event = JSON.parse(event.replace(/[\n\r\t]+/g, ''));
					
				}catch(error){
					
					return reject(error);
					
				}

			}
		
			if(!_.isObject(event.requestContext)){
				
				try{
					
					event.requestContext = JSON.parse(event.requestContext);
					
				}catch(error){
					
					return reject(error);
					
				}

			}

			if(!_.isObject(event.pathParameters)){
				
				try{
					
					event.pathParameters = JSON.parse(event.pathParameters);
					
				}catch(error){
					
					return reject(error);
					
				}

			}

			return resolve(event);
		
		});
		
	}
	
	acquireAccount(event){
		
		du.debug('Acquire Account');
		
		return new Promise((resolve, reject) => {
			
			let pathParameters;
			let account;

			if(_.has(event, "pathParameters")){

				pathParameters = event.pathParameters;

			}else{
			
				return reject(new Error('Unset pathParameters in the event.'));
				
			}

			if(_.has(pathParameters, 'account')){

				account = pathParameters.account;

			}else{
				
				return reject(new Error('Unable to identify account in pathParameters.'));
				
			}
			
			if(!_.isString(account)){
				
				return reject('Unrecognized account format.');
				
			}
			
			permissionutilities.setGlobalAccount(account);
				
			return resolve(event);
			
		});
		
	}
	
	acquireUser(event){
		
		du.debug('Acquire User');
		
		return new Promise((resolve, reject) => {
		
			if(!_.has(event.requestContext, "authorizer")){
			
				return reject(new Error('Unable to identify the authorizer property in the event request context.'));
			
			}
			
			if(!_.has(event.requestContext.authorizer, "user")){
			
				return reject(new Error('Unable to identify the user node in the event request context authorizer property.'));
			
			}
			
			let user_string = event.requestContext.authorizer.user;
			
			du.debug('Event Request Context Authorizer User:', user_string);
			
			if(!_.isString(user_string) || !validator.isEmail(user_string)){
				
				return reject(new Error('Event request context authorizer user is an unrecognized format.'));
				
			}
			
			userController.getUserStrict(user_string).then((user) => {
				
				if(_.has(user, 'id')){
				
					permissionutilities.setGlobalUser(user);
					
				}else if(user == false){
					
					return reject(new Error('Unknown user.  Please contact the system administrator.'));
					
				}
				
				return resolve(event);
				
			}).catch((error) => {
				
				return reject(error);
				
			});
			
		});
		
	}
	
	validateRequiredPermissions(event){
		
		du.debug('Validate Required Permissions');
		
		return new Promise((resolve, reject) => {
		
			permissionutilities.validatePermissionsArray(this.necessary_actions).then((validation) => {
				
				if(validation !== true){ return reject(new Error(validation)); }
				
				return resolve(event);		
				
			}).catch((error) => {
				
				return reject(error);
				
			});
		
		});
	
	}
	
}