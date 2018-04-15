
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

let paginationType = require('../pagination/paginationType');
let merchantProviderGroupType = require('./merchantProviderGroupType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'MerchantProviderGroups',
	description: 'Merchant Provider Groups',
	fields: () => ({
		merchantprovidergroups: {
			type: new GraphQLList(merchantProviderGroupType.graphObj),
			description: 'The Merchant Provider Groups',
		},
		pagination: {
			type: new GraphQLNonNull(paginationType.graphObj),
			description: 'Query pagination',
		}
	}),
	interfaces: []
});
