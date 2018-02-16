'use strict';
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLFloat = require('graphql').GraphQLFloat;

let merchantProviderType = require('./merchantProviderType');

const loadBalancerController = global.SixCRM.routes.include('controllers', 'entities/LoadBalancer.js');

module.exports.graphObj = new GraphQLObjectType({
    name: 'merchantproviderconfiguration',
    description: 'A merchant provider configuration.',
    fields: () => ({
  	   distribution: {
         type: new GraphQLNonNull(GraphQLFloat),
         description: 'The distribution target for the merchant provider instance.',
     },
        merchantprovider: {
            type: merchantProviderType.graphObj,
            description: 'The merchant provider instance associated with the load balancer',
            resolve: merchantproviderconfiguration => loadBalancerController.getMerchantProviderConfiguration(merchantproviderconfiguration)
        }
    }),
    interfaces: []
});
