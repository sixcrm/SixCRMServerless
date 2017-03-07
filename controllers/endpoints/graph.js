'use strict';
const _ = require("underscore");
const graphql =  require('graphql').graphql;

var timestamp = require('../../lib/timestamp.js');
const du = require('../../lib/debug-utilities.js');

let userController = require('../User.js');

class graphController {
	
	execute(event){
		
		//validate that user has access to the account they match up
	
		return this.validateInput(event)
			.then((event) => this.parseEvent(event))
			.then((event) => this.acquireAccount(event))
			.then((event) => this.setGlobalAccount(event))
			.then((event) => this.acquireUser(event))
			.then((event) => this.setGlobalUser(event))
			.then((event) => this.acquireQuery(event))
			.then((event) => this.graphQuery(event));
			
	}	
	
	validateInput(event){

		return new Promise((resolve, reject) => {
			
			resolve(event);
			
		});
		
	}
	
	parseEvent(event){

		return new Promise((resolve, reject) => {
			
			if(!_.isObject(event)){
			
				event = JSON.parse(event.replace(/[\n\r\t]+/g, ''));
				
			}
			
			if(_.has(event, 'requestContext') && !_.isObject(event.requestContext)){
			
				event.requestContext = JSON.parse(event.requestContext);
			
			}
			
			if(_.has(event, 'pathParameters') && !_.isObject(event.pathParameters)){
			
				event.pathParameters = JSON.parse(event.pathParameters);
			
			}
			
			resolve(event);
			
		});
		
		
	}
	
	acquireUser(event){

		return new Promise((resolve, reject) => {
			
			//event coming from Lambda authorizer
			if(_.has(event, 'requestContext') && _.has(event.requestContext, 'authorizer') && _.has(event.requestContext.authorizer, 'user')){
			
				event.user = event.requestContext.authorizer.user;
				
			}else{
				
				return reject(new Error('Undefined user.'));
				
			}
			
			return resolve(event);
			
		});
			
	}
	
	setGlobalUser(event){
		
		du.debug('Set Global User', event);
		
		du.debug('Global', global);
		
		return new Promise((resolve, reject) => {
			
			if(!_.has(event, 'user')){
				return reject(new Error('Missing user object in event'));
			}
			
			let user_string = event.user;
			
			du.debug('user_string', user_string);
			
			if(userController.isUUID(user_string, 4)){
				
				global.disableactionchecks = true; 
				
				global.disableaccountfilter = true;
				
				userController.getHydrated(user_string).then((user) => {
					
					if(_.has(user, 'id')){
					
						global.disableaccountfilter = false;
					
						global.disableactionchecks = false;
					
						global.user = user;
					
						return resolve(event);
						
					}else{
						
						return resolve(event);
						
					}
			
				}).catch((error) => {
					
					du.debug(error);
					
					return reject(error);
				
				});	
			
			}else if(userController.isEmail(user_string)){
				
				du.debug('Is email: '+user_string);
				
				global.disableactionchecks = true;
				
				global.disableaccountfilter = true;
				
				du.debug('Get User By Email');
				
				userController.getUserByEmail(user_string).then((user) => {
					
					du.debug(user);
					
					if(_.has(user, 'id')){
					
						userController.getHydrated(user.id).then((user) => {
							
							global.disableaccountfilter = false;
						
							global.disableactionchecks = false;
					
							du.debug('Setting global user:', user);
							
							if(_.has(user, 'id')){
							
								global.user = user;
								
							}
						
							return resolve(event);
			
						}).catch((error) => {
				
							return reject(error);
				
						});	
						
					}else{
						
						du.debug('Global User', global.user);
						
						global.user = undefined;
						
						du.debug('Resolving Event, user unset', event);
						
						return resolve(event);
						
					}
					
				}).catch((error) => {
					
					return reject(error);
					
				});
				
			}else{
			
				return reject(new Error('A user identifier or a email is required.'));
				
			}
		
		});
	
	}
	
	acquireAccount(event){
		
		return new Promise((resolve, reject) => {
		
			var account; 
			var pathParameters;
			
			if(_.isObject(event) && _.has(event, "pathParameters")){
				
				pathParameters = event.pathParameters;
				
			}
			
			if(_.isObject(pathParameters) && _.has(pathParameters, 'account')){
	
				event.account = pathParameters.account;
					
			}else if(_.isString(pathParameters)){
			
				pathParameters = JSON.parse(pathParameters);
					
				if(_.isObject(pathParameters) && _.has(pathParameters, 'account')){
	
					event.account = pathParameters.account;
				
				}
				
			}
		
			return resolve(event);
			
		});
			
	}
	
	setGlobalAccount(event){

		return new Promise((resolve, reject) => {
			
			if(_.has(event, 'account')){
					
				global.account = event.account;
				
			}
			
			resolve(event);
			
		});
		
	}
	
	acquireQuery(event){

		return new Promise((resolve, reject) => {
		
			var query; 
	
			if(_.isObject(event) && _.has(event, "body")){
				query = event.body;
			}
			
			//what is this??
			if (_.has(event,"query") && _.has(event.query, "query")) {
				query = event.query.query.replace(/[\n\r\t]+/g, '');
			}
			
			//add the query explicitly to the event object
			event.parsed_query = query;
			
			return resolve(event);
			
		});
			
	}
	
	graphQuery(event) {

		var query = event.parsed_query;
		
		du.debug('graph query', query);		
		
		return new Promise((resolve, reject) => {
			
			var SixSchema = require('../../endpoints/graph/schema.js');
	
			graphql(SixSchema, query).then((result) => {
			
				if(_.has(result, "errors")){
					reject(new Error(JSON.stringify(result)));
				}
				
				du.debug(result);
				
				return resolve(result);

			}).catch((error) => {
				
				du.warning(error);
				
				return reject(error);
		
			});
			
		});
				
	}
	
}

module.exports = new graphController();