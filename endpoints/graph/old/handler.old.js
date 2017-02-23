'use strict';
//var { graphql, buildSchema } = require('graphql'); breaks Lambda
const _ = require('underscore');
const graphql = require('graphql').graphql;
const buildSchema  = require('graphql').buildSchema;

var LambdaResponse = require('../../lib/lambda-response.js');
var Schema = require('./schema.js');
//var Resolver = require('./resolver.js');
var SessionController = require('./controllers/Session.js');

module.exports.graph = (event, context, callback) => {
	
	if(!_.isObject(event)){
		event = JSON.parse(event);
	}
	
	let query = event.query;
	
	if (event.query && event.query.hasOwnProperty('query')) {
		query = event.query.query.replace("\n", ' ', "g");
	}
	
	var Schema = buildSchema(`
		type Query {
			hello: String,
			session(id: ID!): Session
		},
		type Session {
			id: String
		}
	`);
	
	var Resolver = { 
		hello: () => 'Hello world!' ,
		session: (obj, args, context) => {	
			//note: what's the obj for?
			return SessionController.getSession(obj.id).then(function(sessionData){
				return new Session(sessionData);
			})
		}
	};
	
	graphql(Schema, query, Resolver)
	.then((response) => {
		if(_.has(response, "errors")){
			throw new Error(JSON.stringify(response));
		}
	  return new LambdaResponse().issueResponse(200, response, callback);
	})
	.catch((error) => {
    	return new LambdaResponse().issueError(error, 500, event, error, callback);
    });
    
}