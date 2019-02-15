const {
	GraphQLInputObjectType,
	GraphQLNonNull,
	GraphQLFloat,
	GraphQLInt,
	GraphQLBoolean,
	GraphQLString,
	GraphQLList
} = require('graphql');
const productAttributesInputType = require('./../../product/components/attributesInputType');

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'TransactionalProductInput',
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
			type: GraphQLBoolean,
			deprecationReason: 'The `ship` field is deprecated and will be removed soon.'
		},
		is_shippable:	{ type: GraphQLBoolean },
		shipping_delay: {
			type: GraphQLInt,
			description: 'The number of seconds to delay shipping after a transaction.',
		},
		price: {
			type: GraphQLFloat,
		},
		default_price: {
			type: GraphQLFloat,
			deprecationReason: 'The `default_price` field is deprecated and will be removed soon.',
		},
		shipping_price: { type: GraphQLFloat },
		merchantprovidergroup:{
			type: GraphQLString,
			description: 'The merchant provider group associated with the product schedule.'
		},
		fulfillment_provider: {
			type: GraphQLString,
			deprecationReason: 'The `fulfillment_provider` field is deprecated and will be removed soon.',
		},
		fulfillment_provider_id: 	{ type: GraphQLString },
		attributes: {
			type: productAttributesInputType.graphObj,
			deprecationReason: 'The `ProductAttributesInput` type is deprecated and will be removed soon.',
		},
		image_urls: { type: new GraphQLList(GraphQLString), defaultValue: [] },
	}),
	interfaces: []
});

module.exports.toTransactionalProductInput = ({
	attributes: {
		images =[]
	} = {},
	default_price,
	fulfillment_provider,
	fulfillment_provider_id,
	image_urls,
	is_shippable,
	price,
	ship,
	...productInput
}) => ({
	...productInput,
	fulfillment_provider_id: fulfillment_provider_id || fulfillment_provider,
	is_shippable: is_shippable || ship,
	price: price || default_price,
	image_urls: image_urls.length ? image_urls : images.map(image => image.path)
});