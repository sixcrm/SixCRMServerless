'use strict';
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

//const eventFunnelGroupType = require('./eventFunnelGroupType');

module.exports.graphObj = new GraphQLObjectType({
    name: 'campaignDeltaType',
    description: 'Campaign Delta',
    fields: () => ({
        hello: {
            type: GraphQLString,
            description: 'placeholder',
        }
    }),
    interfaces: []
});
