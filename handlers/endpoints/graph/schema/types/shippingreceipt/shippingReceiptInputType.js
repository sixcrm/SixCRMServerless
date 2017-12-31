'use strict';
const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
    name: 'ShippingReceiptInputType',
    fields: () => ({
      id:					{ type: new GraphQLNonNull(GraphQLString) },
      fulfillment_provider: { type: new GraphQLNonNull(GraphQLString) },
      trackingnumber:		{ type: GraphQLString },
      status: { type: new GraphQLNonNull(GraphQLString) }
    })
});
