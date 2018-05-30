let _ = require('lodash');

const GraphQLInterfaceType = require('graphql').GraphQLInterfaceType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

module.exports.graphObj = new GraphQLInterfaceType({
	name: 'Gateway',
	description: 'A merchant provider gateway.',
	fields: () => ({
		name: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The name of the merchant provider gateway name.',
		},
		type: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The name of the provider gateway'
		}
	}),
	resolveType(gateway) {

		let gatewaytypes = {
			'NMI': require('./NMIType'),
			'Innovio': require('./InnovioType'),
			'Test': require('./TestMerchantProviderType'),
			'Stripe': require('./StripeType'),
			'AuthorizeNet': require('./AuthorizeNetType'),
		};

		if (_.has(gateway, 'type') && _.has(gatewaytypes, gateway.type)) {
			return gatewaytypes[gateway.type].graphObj;
		}

		return null;

	},
	interfaces: []
});
