
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInt = require('graphql').GraphQLInt;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;

module.exports.graphObj = new GraphQLObjectType({
	name: 'QueueSummaryPeriodType',
	description: 'Queue summary',
	fields: () => ({
		datetime: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The period datetime (end) for the summary.',
		},
		count: {
			type: new GraphQLNonNull(GraphQLInt),
			description: 'A number of messages in a queue.',
		},
	}),
	interfaces: []
});
