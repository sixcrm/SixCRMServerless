const {
	GraphQLNonNull,
	GraphQLString,
	GraphQLInt,
	GraphQLFloat,
	GraphQLBoolean,
	GraphQLList,
	GraphQLInputObjectType
} = require('graphql');

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'ProductInput',
	fields: () => ({
		id:						{ type: GraphQLString },
		name:					{ type: new GraphQLNonNull(GraphQLString) },
		description:	{ type: GraphQLString },
		sku:					{ type: GraphQLString },
		price:       	{ type: GraphQLFloat, defaultValue: 0 },
		is_shippable:	{ type: GraphQLBoolean, defaultValue: false },
		shipping_price: { type: GraphQLFloat },
		shipping_delay: 		{ type: GraphQLInt },
		fulfillment_provider: 	{ type: GraphQLString },
		image_urls: { type: new GraphQLList(GraphQLString), defaultValue: [] },
		updated_at: { type: GraphQLString }
	})
});
