
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'AccountBillingInput',
	fields: () => ({
		plan:	{ type: new GraphQLNonNull(GraphQLString) },
		session: { type: GraphQLString },
		limited_at: { type: GraphQLString },
		deactivated_at: { type: GraphQLString }
	})
});
