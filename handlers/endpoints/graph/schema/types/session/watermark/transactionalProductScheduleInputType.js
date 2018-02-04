'use strict';
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

let transactionalScheduleInputType = require('./transactionalScheduleInputType');

module.exports.graphObj = new GraphQLInputObjectType({
    name: 'TransactionalProductScheduleInput',
    description: 'A transactional product schedule.',
    fields: () => ({
      id: {
        type: GraphQLString,
        description: 'The id of product schedule.',
      },
      name: {
        type: GraphQLString,
        description: 'The name of product schedule.',
      },
      schedule: {
    	  type: new GraphQLList(transactionalScheduleInputType.graphObj),
        description:'The schedules associated with the product schedule'
      },
      loadbalancer:{
        type: GraphQLString,
        description: 'The load balancer associated with the product schedule.'
      }
    }),
    interfaces: []
});
