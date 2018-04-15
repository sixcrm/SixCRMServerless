
const GraphQLList = require('graphql').GraphQLList;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const eventSummaryPeriodEventTypeType= require('./eventSummaryPeriodEventTypeType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'EventSummaryPeriodType',
	description: 'Event summary',
	fields: () => ({
		datetime: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The period datetime (end) for the summary.',
		},
		byeventtype: {
			type: new GraphQLList(eventSummaryPeriodEventTypeType.graphObj),
			description: 'A event period event type summary.',
		},
	}),
	interfaces: []
});
