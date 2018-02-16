'use strict';
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLString = require('graphql').GraphQLString;

let transactionalScheduleType = require('./transactionalScheduleType');
let loadBalancerType = require('./../../loadbalancer/loadBalancerType');
//let watermarkProductSchedule = require('./watermarkProductScheduleType');

module.exports.graphObj = new GraphQLObjectType({
    name: 'TransactionalProductSchedule',
    description: 'A transactional product schedule.',
    fields: () => ({
      name: {
        type: GraphQLString,
        description: 'The name of product schedule.',
      },
      schedule: {
    	  type: new GraphQLList(transactionalScheduleType.graphObj),
        description:'The schedules associated with the product schedule'
      },
      loadbalancer:{
        type: loadBalancerType.graphObj,
        description: 'The load balancer associated with the product schedule.',
        resolve: (productschedule) => {
          var productScheduleController = global.SixCRM.routes.include('controllers','entities/ProductSchedule');

          return productScheduleController.getLoadBalancer(productschedule);
        }
      }
    }),
    interfaces: []
});
