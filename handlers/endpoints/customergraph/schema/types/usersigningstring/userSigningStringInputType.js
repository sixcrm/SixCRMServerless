
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'UserSigningStringInput',
	fields: () => ({
		id:   { type: GraphQLString },
		user:	{ type: new GraphQLNonNull(GraphQLString) },
		name:	{ type: new GraphQLNonNull(GraphQLString) },
		updated_at: { type: GraphQLString }
	})
});
