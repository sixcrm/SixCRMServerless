
const GraphQLFloat = require('graphql').GraphQLFloat;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'MerchantProviderProcessingInput',
	fields: () => ({
		monthly_cap: {
			type: GraphQLFloat,
			description: 'The monthly maximum dollar amount that the merchant provider instance may process.'
		},
		discount_rate:{
			type: GraphQLFloat,
			description: 'The merchant provider instance discount rate.'
		},
		transaction_fee:{
			type: GraphQLFloat,
			description: 'The merchant provider instance transaction fee.'
		},
		reserve_rate:{
			type: GraphQLFloat,
			description: 'The merchant provider instance reserve rate'
		},
		maximum_chargeback_ratio:{
			type: GraphQLFloat,
			description: 'The merchant provider instance maximum chargeback ratio.'
		}
	})
});
