
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLInt = require('graphql').GraphQLInt;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLObjectType = require('graphql').GraphQLObjectType;

module.exports.graphObj = new GraphQLObjectType({
	name: 'eventSummaryPeriodEventTypeType',
	description: 'Event summary period event type.',
	fields: () => ({
		event_type:{
			type: new GraphQLNonNull(GraphQLString),
			description: 'Event type type.',
		},
		count:{
			type: new GraphQLNonNull(GraphQLInt),
			description: 'The event count.',
		}
	}),
	interfaces: []
});
