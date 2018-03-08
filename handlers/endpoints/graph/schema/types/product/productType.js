'use strict';
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLFloat = require('graphql').GraphQLFloat;
const GraphQLBoolean = require('graphql').GraphQLBoolean;
const GraphQLInt = require('graphql').GraphQLInt;
const GraphQLString = require('graphql').GraphQLString;

let merchantProviderGroupType = require('../merchantprovidergroup/merchantProviderGroupType');
let dynamicPricingType = require('./components/dynamicPricingType');
let fulfillmentProviderType = require('../fulfillmentprovider/fulfillmentProviderType');
let productAttributesType = require('./components/attributesType');

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
      description: {
          type: GraphQLString,
          description: 'The product description.',
      },
      sku: {
          type: GraphQLString,
          description: 'The product SKU',
      },
      ship: {
          type: GraphQLBoolean,
          description: 'The product ship, no-ship status.',
      },
      shipping_delay: {
          type: GraphQLInt,
          description: 'The number of seconds to delay shipping after a transaction.',
      },
      default_price: {
          type: GraphQLFloat,
          description: 'A default price for product.',
      },
      dynamic_pricing: {
          type: dynamicPricingType.graphObj,
          description: 'The dynamic pricing range for product.',
      },
      fulfillment_provider: {
          type: fulfillmentProviderType.graphObj,
          description: 'The session associated with the transaction.',
          resolve: product => productController.getFulfillmentProvider(product),
      },
      merchantprovidergroup:{
        type: merchantProviderGroupType.graphObj,
        description: 'The merchant provider group associated with the product.',
        resolve: product => productController.getMerchantProviderGroup(product)
      },
      attributes:{
        type: productAttributesType.graphObj,
        description: 'The attributes associated with the product.'
      },
      created_at: {
        type: GraphQLString,
        description: 'ISO8601 datetime when the entity was created.',
      },
      updated_at: {
        type: GraphQLString,
        description: 'ISO8601 datetime when the entity was updated.',
      }
    }),
    interfaces: []
});
