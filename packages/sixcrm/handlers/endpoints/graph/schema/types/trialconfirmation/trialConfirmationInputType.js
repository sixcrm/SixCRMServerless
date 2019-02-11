const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'TrialConfirmationInputType',
	fields: () => ({
		id: { type: new GraphQLNonNull(GraphQLString) },
		session: { type: new GraphQLNonNull(GraphQLString) },
		customer: { type: new GraphQLNonNull(GraphQLString) },
		code: { type: new GraphQLNonNull(GraphQLString) },
		delivered_at: { type: GraphQLString },
		confirmed_at: { type: GraphQLString },
		expires_at: { type: GraphQLString },
		updated_at: { type: GraphQLString }
	})
});
