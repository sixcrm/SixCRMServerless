
const GraphQLInt = require('graphql').GraphQLInt;
const GraphQLFloat = require('graphql').GraphQLFloat;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

module.exports.graphObj = new GraphQLObjectType({
	name: 'MerchantProviderSummarySubGroupType',
	description: 'Merchant Provider Summary Sub-Group',
	fields: () => ({
		amount:{
			type: new GraphQLNonNull(GraphQLFloat),
			description: 'The summary of today.'
		},
		count:{
			type: new GraphQLNonNull(GraphQLInt),
			description: 'The summary of this week.'
		}
	}),
	interfaces: []
});
