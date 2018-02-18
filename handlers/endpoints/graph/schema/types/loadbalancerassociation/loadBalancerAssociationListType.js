'use strict';
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

let paginationType = require('../pagination/paginationType');
let loadBalancerAssociationType = require('./loadBalancerAssociationType');

module.exports.graphObj = new GraphQLObjectType({
    name: 'LoadBalancerAssociations',
    description: 'Load Balancer Associations',
    fields: () => ({
        loadbalancerassociations: {
            type: new GraphQLList(loadBalancerAssociationType.graphObj),
            description: 'The Load Balancers',
        },
        pagination: {
            type: new GraphQLNonNull(paginationType.graphObj),
            description: 'Query pagination',
        }
    }),
    interfaces: []
});
