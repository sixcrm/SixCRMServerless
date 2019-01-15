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
		ship:					{ type: GraphQLBoolean },
		shipping_delay: 		{ type: GraphQLInt },
		fulfillment_provider: 	{ type: GraphQLString },
		price:       	{ type: GraphQLFloat },
		image_urls: { type: new GraphQLNonNull(new GraphQLList(GraphQLString)) },
		updated_at: { type: GraphQLString }
	})
});
