'use strict';
//var { graphql, buildSchema } = require('graphql'); breaks Lambda
const _ = require('underscore');
const graphql = require('graphql').graphql;

var lr = require('../../lib/lambda-response.js');
var Schema = require('./schema.js');
var Resolver = require('./resolver.js');

module.exports.graph = (event, context, callback) => {
	
	if(!_.isObject(event)){
		event = JSON.parse(event);
	}
	
	let query = event.query;
	
	if (event.query && event.query.hasOwnProperty('query')) {
		query = event.query.query.replace("\n", ' ', "g");
	}

	graphql(Schema, query, Resolver)
	.then((response) => {
		if(_.has(response, "errors")){
			throw new Error(JSON.stringify(response));
		}
	  return lr.issueResponse(200, response, callback);	
	})
	.catch((error) => {
    	return lr.issueError(error, 500, event, error, callback);
    });
    
}