'use strict';
const _ = require("underscore");
const graphql =  require('graphql').graphql;

var timestamp = require('../../lib/timestamp.js');

class graphController {
	
	execute(event, context){
		
	//get the user in the JWT
	//get the account from the request
	//validate that they match up
	
		return this.validateInput(event)
			.then((event) => this.acquireQuery(event))
			.then((event) => this.validateUserPermissions(event))
			.then((event) => this.setAccount(event))
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
	
	validateUserPermissions(event){
		
		//get the user's role permissions
		//get the query 
		
		return new Promise((resolve, reject) => {
			
			//with the query, make sure that the user is permissioned to execute the query on the account
			
			resolve(event);
			
		});
			
	}
	
	setAccount(event){
		
		return new Promise((resolve, reject) => {
			
			global.account = 'd3fa3bf3-7824-49f4-8261-87674482bf1c';
			
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