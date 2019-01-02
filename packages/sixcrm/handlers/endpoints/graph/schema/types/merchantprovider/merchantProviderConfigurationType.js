const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLFloat = require('graphql').GraphQLFloat;

let merchantProviderType = require('./merchantProviderType');

const MerchantProviderGroupController = global.SixCRM.routes.include('controllers', 'entities/MerchantProviderGroup.js');
const merchantProviderGroupController = new MerchantProviderGroupController();

module.exports.graphObj = new GraphQLObjectType({
	name: 'merchantproviderconfiguration',
	description: 'A merchant provider configuration.',
	fields: () => ({
		distribution: {
			type: new GraphQLNonNull(GraphQLFloat),
			description: 'The distribution target for the merchant provider instance.',
		},
		merchantprovider: {
			type: merchantProviderType.graphObj,
			description: 'The merchant provider instance associated with the merchant provider group',
			resolve: merchantproviderconfiguration => merchantProviderGroupController.getMerchantProviderConfiguration(merchantproviderconfiguration)
		}
	}),
	interfaces: []
});
