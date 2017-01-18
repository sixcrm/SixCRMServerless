'use strict';

var _ = require('underscore');
var graphql =  require('graphql').graphql;
var lr = require('../../lib/lambda-response.js');


module.exports.graph = (event, context, callback) => {
	
	var query = event.body;
	
	if (_.has(event,"query") && _.has(event.query, "query")) {
		query = event.query.query.replace("\n", ' ', "g");
	}
	
	var SixSchema = require('./schema.js');

	graphql(SixSchema, query).then(result => {

		if(_.has(result, "errors")){
			throw new Error(JSON.stringify(result));
		}
	  	
	  	return lr.issueResponse(200, result, callback);	

	}).catch((error) => {
	
    	return lr.issueError(error, 500, event, error, callback);
    	
    });
	
}