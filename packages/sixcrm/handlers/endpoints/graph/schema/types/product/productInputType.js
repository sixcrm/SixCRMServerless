const {
	GraphQLNonNull,
	GraphQLString,
	GraphQLInt,
	GraphQLFloat,
	GraphQLBoolean,
	GraphQLList,
	GraphQLInputObjectType
} = require('graphql');
const attributesInputType = require('./components/attributesInputType');
const dynamicPricingInputType = require('./components/dynamicPricingInputType');

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'ProductInput',
	fields: () => ({
		id:						{ type: GraphQLString },
		name:					{ type: new GraphQLNonNull(GraphQLString) },
		description:	{ type: GraphQLString },
		sku:					{ type: GraphQLString },
		price:       	{ type: GraphQLFloat, defaultValue: 0 },
		default_price: {
			type: GraphQLFloat,
			defaultValue: 0,
			deprecationReason: 'The `default_price` field is deprecated and will be removed soon.',
		},
		ship: {
			type: GraphQLBoolean,
			defaultValue: false,
			deprecationReason: 'The `ship` field is deprecated and will be removed soon.'
		},
		is_shippable:	{ type: GraphQLBoolean, defaultValue: false },
		shipping_price: { type: GraphQLFloat },
		shipping_delay: 		{ type: GraphQLInt },
		fulfillment_provider: {
			type: GraphQLString,
			deprecationReason: 'The `fulfillment_provider` field is deprecated and will be removed soon.',
		},
		fulfillment_provider_id: 	{ type: GraphQLString },
		dynamic_pricing: {
			type: dynamicPricingInputType.graphObj,
			deprecationReason: 'The `DynamicPricing` type is deprecated and will be removed soon.',
		},
		attributes: {
			type: attributesInputType.graphObj,
			deprecationReason: 'The `ProductAttributes` type is deprecated and will be removed soon.',
		},
		image_urls: { type: new GraphQLList(GraphQLString), defaultValue: [] },
		updated_at: { type: GraphQLString }
	})
});

module.exports.toProductInput = ({
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
