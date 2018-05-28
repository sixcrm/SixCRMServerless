
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

let paginationType = require('../pagination/paginationType');
let merchantProviderGroupAssociationType = require('./merchantProviderGroupAssociationType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'MerchantProviderGroupAssociations',
	description: 'Merchant Provider Group Associations',
	fields: () => ({
		merchantprovidergroupassociations: {
			type: new GraphQLList(merchantProviderGroupAssociationType.graphObj),
			description: 'The Merchant Provider Groups',
		},
		pagination: {
			type: new GraphQLNonNull(paginationType.graphObj),
			description: 'Query pagination',
		}
	}),
	interfaces: []
});
