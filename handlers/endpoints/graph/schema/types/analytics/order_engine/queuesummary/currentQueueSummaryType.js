
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLList = require('graphql').GraphQLList;
const currentQueueSummaryItemType = require('./currentQueueSummaryItemType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'CurrentQueueSummaryType',
	description: 'Queue Summary',
	fields: () => ({
		summary: {
			type: new GraphQLList(currentQueueSummaryItemType.graphObj),
			description: 'Number of messages in a queue.',
		}
	}),
	interfaces: []
});
