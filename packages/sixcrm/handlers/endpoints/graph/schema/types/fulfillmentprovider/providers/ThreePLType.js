const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLInt = require('graphql').GraphQLInt;
const GraphQLString = require('graphql').GraphQLString;

let ProviderInterfaceType = require('./providerType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'ThreePL',
	description: 'A ThreePL fullfillment provider.',
	interfaces: [ProviderInterfaceType.graphObj],
	fields: () => ({
		name: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The name of the fulfillment provider.',
		},
		username: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'ThreePL username',
		},
		password: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'ThreePL password',
		},
		threepl_customer_id: {
			type: new GraphQLNonNull(GraphQLInt),
			description: 'The ThreePL Customer ID',
		},
		threepl_id: {
			type: new GraphQLNonNull(GraphQLInt),
			description: 'The ThreePL ID',
		},
		threepl_facility_id: {
			type: new GraphQLNonNull(GraphQLInt),
			description: 'The ThreePL Facility ID.',
		},
		threepl_key: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The bracketed ThreePL Key.',
		}
	})
});
