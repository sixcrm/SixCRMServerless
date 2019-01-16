const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInt = require('graphql').GraphQLInt;

let ProviderInterfaceType = require('./providerType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'ShipStation',
	description: 'A ShipStation fullfillment provider.',
	interfaces: [ProviderInterfaceType.graphObj],
	fields: () => ({
		name: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The name of the fulfillment provider.',
		},
		api_key: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'ShipStation API Key',
		},
		api_secret: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'ShipStation API Secret',
		},
		store_id: {
			type: GraphQLInt,
			description: 'ShipStation Store ID',
		}
	})
});
