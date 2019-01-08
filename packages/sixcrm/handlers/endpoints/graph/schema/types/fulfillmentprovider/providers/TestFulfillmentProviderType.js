const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

let ProviderInterfaceType = require('./providerType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'TestFulfillmentProvider',
	description: 'A Test fullfillment provider.',
	interfaces: [ProviderInterfaceType.graphObj],
	fields: () => ({
		name: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The name of the fulfillment provider.',
		}
	})
});
