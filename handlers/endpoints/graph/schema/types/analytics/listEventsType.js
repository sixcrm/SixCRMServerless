'use strict';
const GraphQLList = require('graphql').GraphQLList;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

const listEventsEventType = require('./listEventsEventType');
const analyticsPaginationType = require('./analyticsPaginationType');

module.exports.graphObj = new GraphQLObjectType({
    name: 'listEventsType',
    description: 'Events List',
    fields: () => ({
        events: {
            type: new GraphQLList(listEventsEventType.graphObj),
            description: 'A event',
        },
        pagination: {
            type: new GraphQLNonNull(analyticsPaginationType.graphObj),
            description: 'The pagination results',
        }
    }),
    interfaces: []
});
