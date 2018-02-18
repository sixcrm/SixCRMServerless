'use strict';
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

module.exports.graphObj = new GraphQLInputObjectType({
    name: 'LoadBalancerAssociationInputType',
    fields: () => ({
      id:	{ type: GraphQLString },
      entity:	{ type: new GraphQLNonNull(GraphQLString) },
      entity_type:	{ type: new GraphQLNonNull(GraphQLString) },
      campaign:	{ type: new GraphQLNonNull(GraphQLString) },
      loadbalancer:	{ type: new GraphQLNonNull(GraphQLString) }
    })
});
