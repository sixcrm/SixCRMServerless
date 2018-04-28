const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLString = require('graphql').GraphQLString;

module.exports.graphObj = new GraphQLObjectType({
	name: 'AcceptedInvite',
	description: 'A accepted invite.',
	fields: () => ({
		token: {
			type: new GraphQLNonNull(GraphQLString)
		},
		account: {
			type: new GraphQLNonNull(GraphQLString)
		}
	}),
	interfaces: []
});
