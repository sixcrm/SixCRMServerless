'use strict';
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

let scheduleType = require('./scheduleType');
let loadBalancerType = require('../loadbalancer/loadBalancerType');

module.exports.graphObj = new GraphQLObjectType({
    name: 'ProductSchedule',
    description: 'A product schedule.',
    fields: () => ({
        id: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The id of product schedule.',
        },
        name: {
            type: GraphQLString,
            description: 'The name of product schedule.',
        },
        schedule: {
      	  type: new GraphQLList(scheduleType.graphObj),
            description:'The schedules associated with the product schedule',
      	  resolve: (productschedule) => {
            var productScheduleController = global.routes.include('controllers','entities/ProductSchedule');

            return productScheduleController.getSchedule(productschedule);
          }
        },
        loadbalancer:{
            type: loadBalancerType.graphObj,
            description: 'The load balancer associated with the product schedule.',
            resolve: (productschedule) => {
                var productScheduleController = global.routes.include('controllers','entities/ProductSchedule');

                return productScheduleController.getLoadBalancer(productschedule);
            }
        },
        created_at: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'ISO8601 datetime when the entity was created.',
        },
        updated_at: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'ISO8601 datetime when the entity was updated.',
        }
    }),
    interfaces: []
});
