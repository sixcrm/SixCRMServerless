
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'MerchantProviderGatewayInput',
	fields: () => ({
		name: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The name of the merchant provider gateway name.',
		},
		type:{
			type: new GraphQLNonNull(GraphQLString),
			description: 'The name of the provider gateway'
			//Technical Debt:  Enumerate
		},
		username: {
			type: GraphQLString,
			description: 'The name of the merchant provider gateway username.',
		},
		password: {
			type: GraphQLString,
			description: 'The name of the merchant provider gateway password.',
		},
		endpoint: {
			type: GraphQLString,
			description: 'The name of the merchant provider gateway endpoint.',
		},
		processor_id: {
			type: GraphQLString,
			description: 'The merchant provider processor_id.',
		},
		product_id: {
			type: GraphQLString,
			description: 'The merchant provider product_id.',
		},
		api_key: {
			type: GraphQLString,
			description: 'The merchant provider api_key.',
		}
	})
});
