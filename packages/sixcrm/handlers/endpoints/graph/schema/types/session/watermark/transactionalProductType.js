const {
	GraphQLObjectType,
	GraphQLNonNull,
	GraphQLFloat,
	GraphQLString
} = require('graphql');
const merchantProviderGroupType = require('../../merchantprovidergroup/merchantProviderGroupType');
const fulfillmentProviderType = require('../../fulfillmentprovider/fulfillmentProviderType');

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
			description: 'The merchant provider group associated with the product.',
			resolve: ({ merchant_provider_group_id }) => merchant_provider_group_id && merchantProviderGroupController.get(merchant_provider_group_id)
		},
		fulfillment_provider: {
			type: fulfillmentProviderType.graphObj,
			description: 'The session associated with the transaction.',
			resolve: ({ fulfillment_provider_id }) => fulfillment_provider_id && fulfillmentProviderController.get(fulfillment_provider_id)
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
