'use strict';
const GraphQLList = require('graphql').GraphQLList;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const queueSummaryPeriodType = require('./queueSummaryPeriodType');

module.exports.graphObj = new GraphQLObjectType({
    name: 'QueueSummaryType',
    description: 'Queue summary',
    fields: () => ({
        summary: {
            type: new GraphQLList(queueSummaryPeriodType.graphObj),
            description: 'A queue period summary',
        }
    }),
    interfaces: []
});
