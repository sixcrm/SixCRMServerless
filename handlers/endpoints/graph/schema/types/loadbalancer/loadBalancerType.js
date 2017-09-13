'use strict';
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

let merchantProviderConfigurationType = require('../merchantprovider/merchantProviderConfigurationType');

const loadBalancerController = global.SixCRM.routes.include('controllers', 'entities/LoadBalancer.js');

module.exports.graphObj = new GraphQLObjectType({
    name: 'loadbalancer',
    description: 'A loadbalancer.',
    fields: () => ({
  	    id: {
          type: GraphQLString,
          description: 'The id of the loadbalancer.',
        },
        name: {
            type: GraphQLString,
            description: 'The name of the loadbalancer.',
        },
        merchantproviderconfigurations: {
            type: new GraphQLList(merchantProviderConfigurationType.graphObj),
            description: 'The configured merchant providers associated with the load balancer',
            resolve: loadbalancer => loadBalancerController.getMerchantProviderConfigurations(loadbalancer)
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
