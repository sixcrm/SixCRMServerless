const buildSchema  = require('graphql').buildSchema;
var Schema = buildSchema(`
	  type Query {
		hello: String,
		session(id: ID!): Session
	  },
	  type Session {
	  	id: String
	  }
	`);
	
module.exports = Schema;