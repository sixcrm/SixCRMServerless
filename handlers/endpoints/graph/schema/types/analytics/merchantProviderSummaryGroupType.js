
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

const merchantProviderSummarySubGroupType = require('./merchantProviderSummarySubGroupType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'MerchantProviderSummaryGroupType',
	description: 'Merchant Provider Summary Group',
	fields: () => ({
		today:{
			type: new GraphQLNonNull(merchantProviderSummarySubGroupType.graphObj),
			description: 'The summary of today.'
		},
		thisweek:{
			type: new GraphQLNonNull(merchantProviderSummarySubGroupType.graphObj),
			description: 'The summary of this week.'
		},
		thismonth:{
			type: new GraphQLNonNull(merchantProviderSummarySubGroupType.graphObj),
			description: 'The summary of this month.'
		}
	}),
	interfaces: []
});
