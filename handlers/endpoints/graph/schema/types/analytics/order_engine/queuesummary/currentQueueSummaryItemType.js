'use strict';
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLInt = require('graphql').GraphQLInt;
const GraphQLString = require('graphql').GraphQLString;

module.exports.graphObj = new GraphQLObjectType({
    name: 'CurrentQueueSummaryItemType',
    description: 'Queue Summary Item',
    fields: () => ({
        queuename: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'Number of messages in a queue.',
        },
        number_of_rebills: {
            type: new GraphQLNonNull(GraphQLInt),
            description: 'Number of messages in a queue.',
        },
        avg_time: {
            type: new GraphQLNonNull(GraphQLInt),
            description: 'Average time messages stay in queue.',
        },
        failure_rate: {
            type: new GraphQLNonNull(GraphQLInt),
            description: 'Percentage of fail messages.',
        },
        avg_time_color: {
            type: GraphQLString,
            description: 'Status color of average time property.',
            resolve: item => item.avg_time < 300 ? 'GREEN' : (item.avg_time > 400 ? 'RED' : 'ORANGE')
        },
        failure_rate_color: {
            type: GraphQLString,
            description: 'Status color of failure rate property.',
            resolve: item => item.failure_rate < 5 ? 'GREEN' : (item.failure_rate > 8 ? 'RED' : 'ORANGE')
        }
    }),
    interfaces: []
});
