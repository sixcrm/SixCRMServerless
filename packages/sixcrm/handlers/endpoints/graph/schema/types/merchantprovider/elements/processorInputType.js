
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'MerchantProviderProcessorInput',
	fields: () => ({
		name: {
			type: GraphQLString,
			description: 'The name of the merchant provider processor (bank name).',
		}
	})
});
