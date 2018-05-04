const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

module.exports.graphObj = new GraphQLObjectType({
	name: 'AccountCancelDeactivation',
	description: 'A account deactivation cancellation.',
	fields: () => ({
		message: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The deactivation cancellation result message.',
		}
	}),
	interfaces: []
});
