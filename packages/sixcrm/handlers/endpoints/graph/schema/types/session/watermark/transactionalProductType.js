const {
	GraphQLObjectType,
	GraphQLNonNull,
	GraphQLFloat,
	GraphQLString,
	GraphQLBoolean,
	GraphQLList
} = require('graphql');
const { getProductSetupService, LegacyProduct } = require('@6crm/sixcrm-product-setup');
const merchantProviderGroupType = require('../../merchantprovidergroup/merchantProviderGroupType');
const fulfillmentProviderType = require('../../fulfillmentprovider/fulfillmentProviderType');
const productAttributesType = require('../../product/components/attributesType');

const FulfillmentProviderController = global.SixCRM.routes.include('controllers', 'entities/FulfillmentProvider.js');
const fulfillmentProviderController = new FulfillmentProviderController();

const MerchantProviderGroupController = global.SixCRM.routes.include('controllers', 'entities/MerchantProviderGroup.js');
const merchantProviderGroupController = new MerchantProviderGroupController();

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
			description: '`ship` will be removed. Use `TransactionalProduct.is_shippable` instead.',
			deprecationReason: 'The `ship` field is deprecated and will be removed soon.',
		},
		is_shippable: {
			type: GraphQLBoolean,
			description: 'The product ship, no-ship status.',
		},
		shipping_price: {
			type: GraphQLFloat,
			description: 'A default shipping price for product.',
		},
		shipping_delay: {
			type: GraphQLString,
			description: 'The number of seconds to delay shipping after a transaction.',
		},
		default_price: {
			type: GraphQLFloat,
			description: '`default_price` will be removed. Use `TransactionalProduct.price` and `TransactionalProduct.shipping_price` instead.',
			deprecationReason: 'The `default_price` field is deprecated and will be removed soon.',
		},
		merchantprovidergroup:{
			type: merchantProviderGroupType.graphObj,
			description: 'The merchant provider group associated with the product.',
			resolve: ({ merchant_provider_group_id }) => merchant_provider_group_id && merchantProviderGroupController.get(merchant_provider_group_id)
		},
		fulfillment_provider: {
			type: fulfillmentProviderType.graphObj,
			description: 'The session associated with the transaction.',
			resolve: ({ fulfillment_provider_id }) => fulfillment_provider_id && fulfillmentProviderController.get(fulfillment_provider_id)
		},
		attributes: {
			type: productAttributesType.graphObj,
			description: '`attributes` will be removed. Use `TransactionalProduct.image_urls` instead.',
			deprecationReason: 'The `ProductAttributes` type is deprecated and will be removed soon.',
			resolve: async (product) => {
				const databaseProduct = await getProductSetupService().getProduct(product.id);
				if (databaseProduct) {
					return LegacyProduct.hybridFromProduct(databaseProduct).attributes;
				}

				return LegacyProduct.hybridFromProduct(product).attributes;
			}
		},
		image_urls: {
			type: new GraphQLList(GraphQLString),
			description: 'The product images'
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
