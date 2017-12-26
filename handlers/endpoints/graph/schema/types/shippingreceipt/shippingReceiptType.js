'use strict';
const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;

module.exports.graphObj = new GraphQLObjectType({
    name: 'shippingreceipt',
    description: 'A shipping receipt.',
    fields: () => ({
  	id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The id of the shipping receipt.',
    },
        status: {
            type: GraphQLString,
            description: 'A shipping status',
        },
        trackingnumber: {
            type: GraphQLString,
            description: 'A tracking number for the shipment',
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
