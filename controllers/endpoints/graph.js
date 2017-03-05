'use strict';
const _ = require("underscore");
const graphql =  require('graphql').graphql;

var timestamp = require('../../lib/timestamp.js');
var userController = require('../User.js');

class graphController {
	
	execute(event){
		
		//validate that user has access to the account they match up
	
		return this.validateInput(event)
			.then((event) => this.acquireUser(event))
			.then((event) => this.acquireAccount(event))
			.then((event) => this.setAccount(event))
			.then((event) => this.acquireQuery(event))
			.then((event) => this.graphQuery(event));
			
	}	
	
	validateInput(event){
		
		return new Promise((resolve, reject) => {
			
			resolve(event);
			
		});
		
	}
	
	acquireQuery(event){
		
		return new Promise((resolve, reject) => {
		
			var query; 
	
			if(_.isObject(event) && _.has(event, "body")){
				query = event.body;
			}else if(_.isString(event)){
				try{
					event = JSON.parse(event.replace(/[\n\r\t]+/g, ''))
				}catch(error){
					return reject(error);
				}
				if(_.has(event, "body")){
					query = event.body;
				}
			}

			if (_.has(event,"query") && _.has(event.query, "query")) {
				query = event.query.query.replace(/[\n\r\t]+/g, '');
			}
			
			//add the query explicitly to the event object
			event.parsed_query = query;
			
			return resolve(event);
			
		});
			
	}
	
	acquireAccount(event){
		
		return new Promise((resolve, reject) => {
		
			var account; 
			var pathParameters;
			
			if(_.isObject(event) && _.has(event, "pathParameters")){
				
				pathParameters = event.pathParameters;
				
			}else if(_.isString(event)){
			
				try{
					event = JSON.parse(event.replace(/[\n\r\t]+/g, ''))
				}catch(error){
					return reject(error);
				}
				
				if(_.has(event, "pathParameters")){
					
					pathParameters = event.pathParameters;
					
				}
				
			}
			
			if(_.isObject(pathParameters) && _.has(pathParameters, 'account')){
	
				event.account = pathParameters.account;
					
			}else if(_.isString(pathParameters)){
				
				try{

					pathParameters = JSON.parse(pathParameters);
					
				}catch(error){
				
					return reject(error);
					
				}
				
				if(_.isObject(pathParameters) && _.has(pathParameters, 'account')){
	
					event.account = pathParameters.account;
				
				}
				
			}
		
			return resolve(event);
			
		});
			
	}
	
	//Note:  This method acquires a user object from either the mock request or the authorizer and places that user object in the globals	
	acquireUser(event){
		
		return new Promise((resolve, reject) => {
			
			let user;
			
			//event coming from Lambda authorizer
			if(_.has(event, 'requestContext') && _.has(event.requestContext, 'authorizer') && _.has(event.requestContext.authorizer, 'user')){
				
				user = event.requestContext.authorizer.user;
			
			//mock request	
			}else if(_.isString(event)){
				
				let parsed_event = JSON.parse(event.replace(/[\n\r\t]+/g, ''));
				
				if(_.has(parsed_event, 'requestContext')){
					
					let request_context = JSON.parse(parsed_event.requestContext);
					
					if(_.has(request_context, 'authorizer') && _.has(request_context.authorizer, 'user')){
						
						user = request_context.authorizer.user;
						
					}
					
				}
				
			}
			
			if(_.isString(user)){
				
				global.disableactionchecks = true;
				
				userController.getHydrated(user).then((user) => {
					
					global.disableactionchecks = false;
						
					global.user = user;
				
					return resolve(event);
				
				});
				
			}else{
				
				return reject(new Error('Undefined user id'));
				
			}
			
		});
			
	}
	
	setAccount(event){
		
		return new Promise((resolve, reject) => {
			
			if(_.has(event, 'account')){
					
				global.account = event.account;
				
			}
			
			resolve(event);
			
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