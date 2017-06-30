'use strict';
const GraphQLList = require('graphql').GraphQLList;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

const activityType = require('./activityType');
const analyticsPaginationType = require('./paginationType');

module.exports.graphObj = new GraphQLObjectType({
    name: 'listActivityType',
    description: 'Activity List',
    fields: () => ({
        activity: {
            type: new GraphQLList(activityType.graphObj),
            description: 'Activity',
        },
        pagination: {
            type: new GraphQLNonNull(analyticsPaginationType.graphObj),
            description: 'The pagination results',
        }
    }),
    interfaces: []
});
