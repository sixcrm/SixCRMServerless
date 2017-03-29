'use strict';
const _ = require("underscore");
const graphql =  require('graphql').graphql;

const du = require('../../lib/debug-utilities.js');

let userController = require('../User.js');

class graphController {
	
	execute(event){
		
		//validate that user has access to the account they match up
	
		return this.validateInput(event)
			.then((event) => this.parseEvent(event))
			.then((event) => this.acquireQuery(event))
			.then((event) => this.acquireAccount(event))
			.then((event) => this.setGlobalAccount(event))
			.then((event) => this.acquireUser(event))
			.then((event) => this.retrieveAndSetGlobalUser(event))
			.then((event) => this.graphQuery(event));
			
	}	
	
	validateInput(event){

		// Technical Debt: We might want to do some actual validation here.
		return Promise.resolve(event);
	}
	
	parseEvent(event){

		if(!_.isObject(event)){

			event = JSON.parse(event.replace(/[\n\r\t]+/g, ''));

		}

		if(_.has(event, 'requestContext') && !_.isObject(event.requestContext)){

			event.requestContext = JSON.parse(event.requestContext);

		}

		if(_.has(event, 'pathParameters') && !_.isObject(event.pathParameters)){

			event.pathParameters = JSON.parse(event.pathParameters);

		}

		return Promise.resolve(event);

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
	
	//Technical Debt:  On first login, the user doesn't exist...
	retrieveAndSetGlobalUser(event){
		
		du.debug('Retrieve and Set Global User');
		
		return new Promise((resolve, reject) => {
			
			if(!_.has(event, 'user')){
				return reject(new Error('Missing user object in event'));
			}
			
			let user_string = event.user;
			
			du.debug('user_string', user_string);
			
			userController.getUserStrict(user_string).then((user) => {
				
				if(_.has(user, 'id')){
					du.debug('Is a user object.');
					userController.setGlobalUser(user);
				}else if(user == false){
					du.debug('Unable to acquire user, setting global user to email.');
					userController.setGlobalUser(user_string);
				}
				
				return resolve(event);
				
			}).catch((error) => {
				
				return reject(error);
				
			});
		
		});
	
	}
	
	acquireAccount(event){
		
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

		return Promise.resolve(event);
			
	}
	
	setGlobalAccount(event){

		if(_.has(event, 'account')){

			global.account = event.account;

		}

		return Promise.resolve(event);
			
	}
	
	acquireQuery(event){

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

		return Promise.resolve(event);

	}
	
	graphQuery(event) {

		var query = event.parsed_query;
		
		du.debug('graph query', query);		
		
		return new Promise((resolve, reject) => {
			
			var SixSchema = require('../../endpoints/graph/schema.js');
	
			graphql(SixSchema, query).then((result) => {
			
				if(_.has(result, "errors")){
				
					return reject(new Error(JSON.stringify(result)));
					
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