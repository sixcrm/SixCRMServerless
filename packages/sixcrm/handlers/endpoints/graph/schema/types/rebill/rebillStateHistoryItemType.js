
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

module.exports.graphObj = new GraphQLObjectType({
	name: 'RebillStateHistoryItem',
	description: 'A details about a state rebill was once in.',
	fields: () => ({
		state: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The state of the rebill.',
		},
		error_message: {
			type: GraphQLString,
			description: 'Error message of a rebill.',
		},
		entered_at: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The date rebill entered the state.',
		},
		exited_at: {
			type: GraphQLString,
			description: 'The date rebill exited the state.',
		}
	}),
	interfaces: []
});
