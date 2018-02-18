'use strict';
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

let campaignType = require('../campaign/campaignType');
let loadbalancerType = require('../loadbalancer/loadBalancerType');

const loadBalancerAssociationController = global.SixCRM.routes.include('controllers', 'entities/LoadBalancerAssociation.js');

module.exports.graphObj = new GraphQLObjectType({
    name: 'LoadbalancerAssociation',
    description: 'A loadbalancer association.',
    fields: () => ({
  	    id: {
          type: GraphQLString,
          description: 'The id of the loadbalancer association.',
        },
        entity:{
          type: new GraphQLNonNull(GraphQLString),
          description: 'The entity associated with the loadbalancer and the campaign.'
        },
        entity_type:{
          type: new GraphQLNonNull(GraphQLString),
          description: 'The associated entity\'s type.'
        },
    		loadbalancer:{
          type: new GraphQLNonNull(loadbalancerType.graphObj),
          description: 'The loadbalancer.',
          resolve: (loadbalancerassociation) => {
            return loadBalancerAssociationController.getLoadBalancer(loadbalancerassociation);
          }
        },
    		campaign:{
          type: new GraphQLNonNull(campaignType.graphObj),
          description: 'The campaign.',
          resolve: (loadbalancerassociation) => {
            return loadBalancerAssociationController.getCampaign(loadbalancerassociation);
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
