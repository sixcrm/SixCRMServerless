'use strict';
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLInt = require('graphql').GraphQLInt;

module.exports.graphObj = new GraphQLObjectType({
    name: 'QueueStateType',
    description: 'Queue state',
    fields: () => ({
        count: {
            type: new GraphQLNonNull(GraphQLInt),
            description: 'Number of messages in a queue.',
            resolve: function(args){
              const analyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');

              return analyticsController.executeAnalyticsFunction(args, 'getRebillSummary').then((result) => {
                const item = result.summary[0] || {};

                return item.count || 0;
              });
            }
        },
        average_time: {
            type: new GraphQLNonNull(GraphQLInt),
            description: 'Average time messages stay in queue.',
            resolve: function(args){
              const analyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');

              return analyticsController.executeAnalyticsFunction(args, 'getQueueAverageTime').then((result) => {
                const item = result.summary[0] || {};

                return item.averagetime || 0;
              });

            }
        },
        failure_rate: {
            type: new GraphQLNonNull(GraphQLInt),
            description: 'Percentage of fail messages.',
            resolve: function(args){
              const analyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');

              return analyticsController.executeAnalyticsFunction(args, 'getQueueFailure').then((result) => {
                const item = result.summary[0] || {};

                return item.failure_percentage || 0;
              });

            }
        }
    }),
    interfaces: []
});
