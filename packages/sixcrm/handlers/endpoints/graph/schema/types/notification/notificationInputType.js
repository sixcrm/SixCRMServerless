
//const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;
const GraphQLJSON = require('graphql-type-json');

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'NotificationInput',
	fields: () => ({
		id:			    { type: GraphQLString },
		user:		    { type: GraphQLString },
		account:  	{ type: GraphQLString },
		name: 	    { type: GraphQLString },
		type: 	    { type: GraphQLString },
		context:   	{ type: GraphQLJSON },
		category:   { type: GraphQLString },
		expires_at:	{ type: GraphQLString },
		read_at:	  { type: GraphQLString },
		updated_at: { type: GraphQLString }
	})
});
