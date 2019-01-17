
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'returnHistoryInputType',
	fields: () => ({
		state:	{ type: new GraphQLNonNull(GraphQLString) },
		created_at: { type: new GraphQLNonNull(GraphQLString) }
	})
});
