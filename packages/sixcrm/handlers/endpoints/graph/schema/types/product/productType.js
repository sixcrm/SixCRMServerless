const {
	GraphQLObjectType,
	GraphQLNonNull,
	GraphQLFloat,
	GraphQLBoolean,
	GraphQLInt,
	GraphQLString,
	GraphQLList
} = require('graphql');

const merchantProviderGroupType = require('../merchantprovidergroup/merchantProviderGroupType');
const dynamicPricingType = require('./components/dynamicPricingType');
const fulfillmentProviderType = require('../fulfillmentprovider/fulfillmentProviderType');
const productAttributesType = require('./components/attributesType');
const emailTemplateType = require('../emailtemplate/emailTemplateType');

const FulfillmentProviderController = global.SixCRM.routes.include('controllers', 'entities/FulfillmentProvider.js');
const fulfillmentProviderController = new FulfillmentProviderController();

const MerchantProviderGroupController = global.SixCRM.routes.include('controllers', 'entities/MerchantProviderGroup.js');
const merchantProviderGroupController = new MerchantProviderGroupController();

const EmailTemplateController = global.SixCRM.routes.include('controllers', 'entities/EmailTemplate.js');
const emailTemplateController = new EmailTemplateController();

const shippingIntervalToSeconds = ({ hours = 0, minutes = 0, seconds = 0 }) => hours * 60 * 60 + minutes * 60 + seconds;

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
			description: '`ship` will be removed. Use `Product.is_shippable` instead.',
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
			type: GraphQLInt,
			description: 'The number of seconds to delay shipping after a transaction.',
			resolve: ({ shipping_delay }) => shipping_delay ? shippingIntervalToSeconds(shipping_delay): shipping_delay
		},
		default_price: {
			type: GraphQLFloat,
			description: '`default_price` will be removed. Use `Product.price` and `Product.shipping_price` instead.',
			deprecationReason: 'The `default_price` field is deprecated and will be removed soon.',
		},
		price: {
			type: GraphQLFloat,
			description: 'A default price for product.',
		},
		dynamic_pricing: {
			type: dynamicPricingType.graphObj,
			description: '`dynamic_pricing` will be removed. Use `Product.price` and `Product.shipping_price` instead.',
			deprecationReason: 'The `DynamicPricing` type is deprecated and will be removed soon.',
		},
		fulfillment_provider: {
			type: fulfillmentProviderType.graphObj,
			description: 'The session associated with the transaction.',
			resolve: async ({ fulfillment_provider_id }) => fulfillment_provider_id && fulfillmentProviderController.get({ id: fulfillment_provider_id })
		},
		merchantprovidergroup: {
			type: merchantProviderGroupType.graphObj,
			description: 'The merchant provider group associated with the product.',
			resolve: async ({ merchant_provider_group_id }) => merchant_provider_group_id && merchantProviderGroupController.get({ id: merchant_provider_group_id })
		},
		attributes: {
			type: productAttributesType.graphObj,
			description: '`attributes` will be removed. Use `Product.image_urls` instead.',
			deprecationReason: 'The `ProductAttributes` type is deprecated and will be removed soon.',
		},
		image_urls: {
			type: new GraphQLNonNull(new GraphQLList(GraphQLString)),
			description: 'The product images',
		},
		emailtemplates: {
			type: new GraphQLList(emailTemplateType.graphObj),
			description: 'Email templates associated with this product.',
			resolve: (product) => emailTemplateController.listByProduct(product)
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
