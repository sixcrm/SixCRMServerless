const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLBoolean = require('graphql').GraphQLBoolean;

module.exports.graphObj = new GraphQLObjectType({
	name: 'AcceptedInvite',
	description: 'A accepted invite.',
	fields: () => ({
		is_new: {
			type: new GraphQLNonNull(GraphQLBoolean)
		},
		account: {
			type: new GraphQLNonNull(GraphQLString)
		}
	}),
	interfaces: []
});
