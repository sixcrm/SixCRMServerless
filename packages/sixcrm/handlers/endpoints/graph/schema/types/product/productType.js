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
const fulfillmentProviderType = require('../fulfillmentprovider/fulfillmentProviderType');
const emailTemplateType = require('../emailtemplate/emailTemplateType');

const FulfillmentProviderController = global.SixCRM.routes.include('controllers', 'entities/FulfillmentProvider.js');
const fulfillmentProviderController = new FulfillmentProviderController();

const MerchantProviderGroupController = global.SixCRM.routes.include('controllers', 'entities/MerchantProviderGroup.js');
const merchantProviderGroupController = new MerchantProviderGroupController();

const EmailTemplateController = global.SixCRM.routes.include('controllers', 'entities/EmailTemplate.js');
const emailTemplateController = new EmailTemplateController();

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
			resolve: product => product.is_shippable
		},
		shipping_price: {
			type: GraphQLFloat,
			description: 'A default shipping price for product.',
		},
		shipping_delay: {
			type: GraphQLInt,
			description: 'The number of seconds to delay shipping after a transaction.',
		},
		price: {
			type: GraphQLFloat,
			description: 'A default price for product.',
		},
		fulfillment_provider: {
			type: fulfillmentProviderType.graphObj,
			description: 'The session associated with the transaction.',
			resolve: ({ fulfillment_provider_id }) => fulfillment_provider_id && fulfillmentProviderController.get(fulfillment_provider_id)
		},
		merchantprovidergroup:{
			type: merchantProviderGroupType.graphObj,
			description: 'The merchant provider group associated with the product.',
			resolve: ({ merchant_provider_group_id }) => merchant_provider_group_id && merchantProviderGroupController.get(merchant_provider_group_id)
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
