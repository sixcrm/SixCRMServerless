'use strict';
const _ = require("underscore");
const graphql =  require('graphql').graphql;

var timestamp = require('../../lib/timestamp.js');
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

		return new Promise((resolve, reject) => {
			
			if(!_.has(event, 'user')){
				reject(new Error('Missing user object in event'));
			}
			
			let user_string = event.user;
			
			global.disableactionchecks = true;
			
			if(userController.isUUID(user_string, 4)){
				
				userController.getHydrated(user_string).then((user) => {

					global.disableactionchecks = false;
					
					global.user = user;
					
					return resolve(event);
			
				}).catch((error) => {
				
					reject(error);
				
				});	
			
			}else if(userController.isEmail(user_string)){
				
				global.disableactionchecks = true;
				
				userController.getUserByEmail(user_string).then((user) => {
						
					userController.getHydrated(user.id).then((user) => {
						
						global.disableactionchecks = false;
					
						global.user = user;
						
						return resolve(event);
			
					}).catch((error) => {
				
						reject(error);
				
					});	
					
				}).catch((error) => {
					
					reject(error);
					
				});
				
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
		
		return new Promise((resolve, reject) => {
			
			var SixSchema = require('../../endpoints/graph/schema.js');
	
			graphql(SixSchema, query).then((result) => {
			
				if(_.has(result, "errors")){
					reject(new Error(JSON.stringify(result)));
				}
		
				resolve(result);

			}).catch((error) => {
	
				reject(error);
		
			});
			
		});
				
	}
	
}

module.exports = new graphController();