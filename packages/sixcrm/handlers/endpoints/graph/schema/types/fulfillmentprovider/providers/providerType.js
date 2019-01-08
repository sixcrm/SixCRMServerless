let _ = require('lodash');

const GraphQLInterfaceType = require('graphql').GraphQLInterfaceType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

module.exports.graphObj = new GraphQLInterfaceType({
	name: 'FulfillmentProviderConfigurationInterface',
	description: 'A fulfillment provider configuration interface.',
	fields: () => ({
		name: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The name of the fulfillment provider.',
		}
	}),
	resolveType(provider) {

		let providertypes = {
			'Hashtag': require('./HashtagType'),
			'ThreePL': require('./ThreePLType'),
			'Test': require('./TestFulfillmentProviderType'),
			'ShipStation': require('./ShipStationType')
		};

		if (_.has(providertypes, provider.name)) {
			return providertypes[provider.name].graphObj;
		} else {
			return null;
		}

	},
	interfaces: []
});
