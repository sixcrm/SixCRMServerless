const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

let merchantProviderConfigurationType = require('../merchantprovider/merchantProviderConfigurationType');

const MerchantProviderGroupController = global.SixCRM.routes.include('controllers', 'entities/MerchantProviderGroup.js');
const merchantProviderGroupController = new MerchantProviderGroupController();

module.exports.graphObj = new GraphQLObjectType({
	name: 'merchantprovidergroup',
	description: 'A merchantprovidergroup.',
	fields: () => ({
		id: {
			type: GraphQLString,
			description: 'The id of the merchantprovidergroup.',
		},
		name: {
			type: GraphQLString,
			description: 'The name of the merchantprovidergroup.',
		},
		merchantproviderconfigurations: {
			type: new GraphQLList(merchantProviderConfigurationType.graphObj),
			description: 'The configured merchant providers associated with the merchant provider group',
			resolve: merchantprovidergroup => merchantProviderGroupController.getMerchantProviderConfigurations(merchantprovidergroup)
		},
		created_at: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'ISO8601 datetime when the entity was created.',
		},
		updated_at: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'ISO8601 datetime when the entity was updated.',
		}
	}),
	interfaces: []
});
