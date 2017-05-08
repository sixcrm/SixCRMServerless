'use strict';
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

const eventFunnelGroupType = require('./eventFunnelGroupType');

module.exports.graphObj = new GraphQLObjectType({
    name: 'eventFunnelType',
    description: 'Event Funnel',
    fields: () => ({
        funnel: {
            type: eventFunnelGroupType.graphObj,
            description: 'The event funnel groups',
        }
    }),
    interfaces: []
});
