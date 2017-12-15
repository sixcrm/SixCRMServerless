'use strict';
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLInt = require('graphql').GraphQLInt;
const GraphQLString = require('graphql').GraphQLString;

module.exports.graphObj = new GraphQLObjectType({
    name: 'QueueStateType',
    description: 'Queue state',
    fields: () => ({
        count: {
            type: new GraphQLNonNull(GraphQLInt),
            description: 'Number of messages in a queue.',
        },
        average_time: {
            type: new GraphQLNonNull(GraphQLInt),
            description: 'Average time messages stay in queue.',
        },
        failure_rate: {
            type: new GraphQLNonNull(GraphQLInt),
            description: 'Percentage of fail messages.',
        },
        success_rate: {
          type: new GraphQLNonNull(GraphQLInt),
          description: 'Percentage of fail messages.',
        },
        expired_rate: {
          type: new GraphQLNonNull(GraphQLInt),
          description: 'Percentage of fail messages.',
        },
        error_rate: {
            type: new GraphQLNonNull(GraphQLInt),
            description: 'Percentage of fail messages.',
        },
        average_time_color: {
            type: GraphQLString,
            description: 'Status color of average time property.'
        },
        failure_rate_color: {
            type: GraphQLString,
            description: 'Status color of failure rate property.'
        }
    }),
    interfaces: []
});
