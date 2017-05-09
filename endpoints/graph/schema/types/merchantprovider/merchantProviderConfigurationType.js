'use strict';
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

let merchantProviderType = require('./merchantProviderType');

const loadBalancerController = require('../../../../../controllers/LoadBalancer.js');

module.exports.graphObj = new GraphQLObjectType({
    name: 'merchantproviderconfiguration',
    description: 'A merchant provider configuration.',
    fields: () => ({
  	distribution: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The distribution of the merchantprovider.',
  },
        merchantprovider: {
            type: merchantProviderType.graphObj,
            description: 'The merchant provider associated with the load balancer',
            resolve: merchantproviderconfiguration => loadBalancerController.getMerchantProviderConfiguration(merchantproviderconfiguration)
        }
    }),
    interfaces: []
});
