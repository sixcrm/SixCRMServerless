const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'UserACLInputType',
	fields: () => ({
		id: {
			type: GraphQLString
		},
		pending: {
			type: GraphQLString
		},
		user: {
			type: new GraphQLNonNull(GraphQLString)
		},
		account: {
			type: new GraphQLNonNull(GraphQLString)
		},
		role: {
			type: new GraphQLNonNull(GraphQLString)
		},
		updated_at: {
			type: GraphQLString
		}
	})
});
