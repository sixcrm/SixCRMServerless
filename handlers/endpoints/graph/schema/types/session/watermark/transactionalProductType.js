
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLFloat = require('graphql').GraphQLFloat;
const GraphQLString = require('graphql').GraphQLString;

let merchantProviderGroupType = require('../../merchantprovidergroup/merchantProviderGroupType');
let fulfillmentProviderType = require('../../fulfillmentprovider/fulfillmentProviderType');
let productAttributesType = require('../../product/components/attributesType');

const ProductController = global.SixCRM.routes.include('controllers', 'entities/Product.js');
const productController = new ProductController();

module.exports.graphObj = new GraphQLObjectType({
	name: 'TransactionalProduct',
	description: 'A transactional product.',
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
			type: GraphQLString,
			description: 'The product ship, no-ship status.',
		},
		shipping_delay: {
			type: GraphQLString,
			description: 'The number of seconds to delay shipping after a transaction.',
		},
		default_price: {
			type: GraphQLFloat,
			description: 'A default price for product.',
		},
		merchantprovidergroup:{
			type: merchantProviderGroupType.graphObj,
			description: 'The merchant provider group associated with the product schedule.',
			resolve: (product) => productController.getMerchantProviderGroup(product)
		},
		fulfillment_provider: {
			type: fulfillmentProviderType.graphObj,
			description: 'The session associated with the transaction.',
			resolve: product => productController.getFulfillmentProvider(product)
		},
		attributes:{
			type: productAttributesType.graphObj,
			description: 'The attributes associated with the product.',
			resolve: product => productController.get({id: product.id}).then(p => {
				if (p) {
					return p.attributes;
				}

				return product.attributes;
			})
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
