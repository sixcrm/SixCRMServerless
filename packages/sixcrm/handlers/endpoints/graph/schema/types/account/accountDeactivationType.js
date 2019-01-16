const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

module.exports.graphObj = new GraphQLObjectType({
	name: 'AccountDeactivation',
	description: 'A account deactivation.',
	fields: () => ({
		deactivate: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The deactivation date for the account.',
		},
		message: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The deactivation result message.',
		}
	}),
	interfaces: []
});
