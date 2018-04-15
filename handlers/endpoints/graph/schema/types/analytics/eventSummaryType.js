
const GraphQLList = require('graphql').GraphQLList;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const eventSummaryPeriodType = require('./eventSummaryPeriodType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'EventSummaryType',
	description: 'Event summary',
	fields: () => ({
		events: {
			type: new GraphQLList(eventSummaryPeriodType.graphObj),
			description: 'The event period summaries',
		}
	}),
	interfaces: []
});
