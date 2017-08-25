'use strict';
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLFloat = require('graphql').GraphQLFloat;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
    name: 'ProductInput',
    fields: () => ({
        id:						{ type: GraphQLString },
        name:					{ type: new GraphQLNonNull(GraphQLString) },
        sku:					{ type: new GraphQLNonNull(GraphQLString) },
        ship:					{ type: new GraphQLNonNull(GraphQLString) },
        shipping_delay: 		{ type: GraphQLString },
        fulfillment_provider: 	{ type: GraphQLString },
        default_price:       	{ type: GraphQLFloat }
    })
});
