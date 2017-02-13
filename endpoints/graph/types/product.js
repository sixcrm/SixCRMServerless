var GraphQLObjectType = require('graphql').GraphQLObjectType;
var GraphQLNonNull = require('graphql').GraphQLNonNull;
var GraphQLNonNull = require('graphql').GraphQLString;

module.exports.productType = new GraphQLObjectType({
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
		type: fulfillmentProviderType,
		description: 'The session associated with the transaction.',
		resolve: product => productController.getFulfillmentProvider(product),    
    }
  }),
  interfaces: []
});