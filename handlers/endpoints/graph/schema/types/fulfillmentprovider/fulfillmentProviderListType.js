
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

let fulfillmentProviderType = require('./fulfillmentProviderType');
let paginationType = require('../pagination/paginationType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'FulfillmentProviders',
	description: 'Fulfillment providers',
	fields: () => ({
		fulfillmentproviders: {
			type: new GraphQLList(fulfillmentProviderType.graphObj),
			description: 'The fulfillment providers',
		},
		pagination: {
			type: new GraphQLNonNull(paginationType.graphObj),
			description: 'Query pagination',
		}
	}),
	interfaces: []
});
