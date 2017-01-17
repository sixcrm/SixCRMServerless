'use strict';

var _ = require('underscore');
var graphql =  require('graphql').graphql;
var SixSchema = require('./schema.js');
var lr = require('../../lib/lambda-response.js');


module.exports.graph = (event, context, callback) => {
	
	if(!_.isObject(event)){
		event = JSON.parse(event);
	}
	
	let query = event.query;
	
	if (event.query && event.query.hasOwnProperty('query')) {
		query = event.query.query.replace("\n", ' ', "g");
	}
	
	graphql(SixSchema, query).then(result => {
		
		if(_.has(result, "errors")){
			throw new Error(JSON.stringify(result));
		}
	  	
	  	return lr.issueResponse(200, result, callback);	

	}).catch((error) => {
	
    	return lr.issueError(error, 500, event, error, callback);
    	
    });
	
}