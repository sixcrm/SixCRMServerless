'use strict';
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

let fulfillmentProviderType = require('../fulfillmentprovider/fulfillmentProviderType');

const productController = global.SixCRM.routes.include('controllers', 'entities/Product.js');

module.exports.graphObj = new GraphQLObjectType({
    name: 'Product',
    description: 'A product for sale.',
    fields: () => ({
        id: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The id of the product.',
        },
        name: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The name of the product.',
        },
        sku: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The product SKU',
        },
        ship: {
            type: GraphQLString,
            description: 'The product ship, no-ship status.',
        },
        shipping_delay: {
            type: GraphQLString,
            description: 'The number of seconds to delay shipping after a transaction.',
        },
        fulfillment_provider: {
            type: fulfillmentProviderType.graphObj,
            description: 'The session associated with the transaction.',
            resolve: product => productController.getFulfillmentProvider(product),
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
