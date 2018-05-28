
const GraphQLInt = require('graphql').GraphQLInt;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'MerchantProviderProcesstingTransactionCountInput',
	fields: () => ({
		daily: {
			type: GraphQLInt,
			description: 'The maximum number of transactions that the merchant provider may process in a single day.'
		},
		weekly: {
			type: GraphQLInt,
			description: 'The maximum number of transactions that the merchant provider may process in a single week.'
		},
		monthly: {
			type: GraphQLInt,
			description: 'The maximum number of transactions that the merchant provider may process in a single month.'
		}
	})
});
