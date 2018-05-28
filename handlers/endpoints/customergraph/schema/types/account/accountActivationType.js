const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLBoolean = require('graphql').GraphQLBoolean;
const GraphQLString = require('graphql').GraphQLString;

module.exports.graphObj = new GraphQLObjectType({
	name: 'AccountActivation',
	description: 'A account activation.',
	fields: () => ({
		activated: {
			type: new GraphQLNonNull(GraphQLBoolean),
			description: 'The activation result of the account.',
		},
		message: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The activation result message.',
		}
	}),
	interfaces: []
});
