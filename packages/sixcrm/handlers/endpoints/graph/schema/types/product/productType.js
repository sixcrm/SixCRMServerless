
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLFloat = require('graphql').GraphQLFloat;
const GraphQLBoolean = require('graphql').GraphQLBoolean;
const GraphQLInt = require('graphql').GraphQLInt;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLList = require('graphql').GraphQLList;


let merchantProviderGroupType = require('../merchantprovidergroup/merchantProviderGroupType');
let dynamicPricingType = require('./components/dynamicPricingType');
let fulfillmentProviderType = require('../fulfillmentprovider/fulfillmentProviderType');
let productAttributesType = require('./components/attributesType');
let emailTemplateType = require('../emailtemplate/emailTemplateType');

const ProductController = global.SixCRM.routes.include('controllers', 'entities/Product.js');
const productController = new ProductController();

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
		default_price: {
			type: GraphQLFloat,
			description: 'A default price for product.',
			resolve: product => product.price
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
