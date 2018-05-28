
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

let paginationType = require('../pagination/paginationType');
let merchantProviderType = require('./merchantProviderType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'MerchantProviders',
	description: 'Merchant providers',
	fields: () => ({
		merchantproviders: {
			type: new GraphQLList(merchantProviderType.graphObj),
			description: 'The merchant providers',
		},
		pagination: {
			type: new GraphQLNonNull(paginationType.graphObj),
			description: 'Query pagination',
		}
	}),
	interfaces: []
});
