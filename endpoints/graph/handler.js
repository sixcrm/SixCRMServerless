'use strict';

var _ = require('underscore');
var graphql =  require('graphql').graphql;
var LambdaResponse = require('../../lib/lambda-response.js');


module.exports.graph = (event, context, callback) => {
	
	var query; 
	
	if(_.isObject(event) && _.has(event, "body")){
		query = event.body;
	}else if(_.isString(event)){
		try{
			event = JSON.parse(event.replace(/[\n\r\t]+/g, ''))
		}catch(error){
			return new LambdaResponse().issueError(error, 500, event, error, callback);
		}
		if(_.has(event, "body")){
			query = event.body;
		}
	}
	
	if (_.has(event,"query") && _.has(event.query, "query")) {
		query = event.query.query.replace(/[\n\r\t]+/g, '');
	}
	
	var SixSchema = require('./schema.js');
	
	graphql(SixSchema, query).then(result => {
		if(_.has(result, "errors")){
			throw new Error(JSON.stringify(result));
		}
	  	
	  	return new LambdaResponse().issueResponse(200, result, callback);

	}).catch((error) => {
	
    	return new LambdaResponse().issueError(error, 500, event, error, callback);
    	
    });
	
}