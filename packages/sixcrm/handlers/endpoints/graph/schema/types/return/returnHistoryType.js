
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

module.exports.graphObj = new GraphQLObjectType({
	name: 'returnHistoryType',
	description: 'A details about a return history.',
	fields: () => ({
		state: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The state of the return.',
		},
		created_at: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The date return entered the state.',
		}
	}),
	interfaces: []
});
