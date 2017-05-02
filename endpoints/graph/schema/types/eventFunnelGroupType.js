'use strict';
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

const eventFunnelGroupResponseType = require('./eventFunnelGroupResponseType');

module.exports.graphObj = new GraphQLObjectType({
    name: 'EventFunnelGroupType',
    description: 'The event funnel groups',
    fields: () => ({
        click:{
            type: new GraphQLNonNull(eventFunnelGroupResponseType.graphObj),
            description: 'Click overview'
        },
        lead:{
            type: new GraphQLNonNull(eventFunnelGroupResponseType.graphObj),
            description: 'Lead overview'
        },
        main:{
            type: new GraphQLNonNull(eventFunnelGroupResponseType.graphObj),
            description: 'Main overview'
        },
        upsell:{
            type: new GraphQLNonNull(eventFunnelGroupResponseType.graphObj),
            description: 'Upsell overview'
        },
        confirm:{
            type: new GraphQLNonNull(eventFunnelGroupResponseType.graphObj),
            description: 'Confirm overview'
        }
    }),
    interfaces: []
});
