
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLList = require('graphql').GraphQLList;

const eventFunnelGroupResponseType = require('./eventFunnelGroupResponseType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'eventFunnelType',
	description: 'Event Funnel',
	fields: () => ({
		funnel: {
			type: new GraphQLList(eventFunnelGroupResponseType.graphObj),
			description: 'The event funnel groups',
		}
	}),
	interfaces: []
});
