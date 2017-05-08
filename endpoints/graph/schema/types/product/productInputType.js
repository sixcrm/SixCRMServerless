'use strict';
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
    name: 'ProductInput',
    fields: () => ({
        id:						{ type: new GraphQLNonNull(GraphQLString) },
        name:					{ type: new GraphQLNonNull(GraphQLString) },
        sku:					{ type: new GraphQLNonNull(GraphQLString) },
        ship:					{ type: new GraphQLNonNull(GraphQLString) },
        shipping_delay: 		{ type: new GraphQLNonNull(GraphQLString) },
        fulfillment_provider: 	{ type: new GraphQLNonNull(GraphQLString) }
    })
});
