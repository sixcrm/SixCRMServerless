const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLString = require('graphql').GraphQLString;

module.exports.graphObj = new GraphQLObjectType({
	name: 'Invite',
	description: 'A invite.',
	fields: () => ({
		hash: {
			type: new GraphQLNonNull(GraphQLString)
		},
		email: {
			type: new GraphQLNonNull(GraphQLString)
		},
		acl: {
			type: new GraphQLNonNull(GraphQLString)
		},
		invitor: {
			type: new GraphQLNonNull(GraphQLString)
		},
		account: {
			type: new GraphQLNonNull(GraphQLString)
		},
		account_name: {
			type: new GraphQLNonNull(GraphQLString)
		},
		role: {
			type: new GraphQLNonNull(GraphQLString)
		},
		timestamp: {
			type: new GraphQLNonNull(GraphQLString)
		}
	}),
	interfaces: []
});
