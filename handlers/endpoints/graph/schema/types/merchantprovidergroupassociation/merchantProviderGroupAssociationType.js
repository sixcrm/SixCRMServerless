const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

let campaignType = require('../campaign/campaignType');
let merchantprovidergroupType = require('../merchantprovidergroup/merchantProviderGroupType');

const MerchantProviderGroupAssociationController = global.SixCRM.routes.include('controllers', 'entities/MerchantProviderGroupAssociation.js');
const merchantProviderGroupAssociationController = new MerchantProviderGroupAssociationController();

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;

module.exports.graphObj = new GraphQLObjectType({
	name: 'MerchantProviderGroupAssociation',
	description: 'A merchantprovidergroup association.',
	fields: () => ({
		id: {
			type: GraphQLString,
			description: 'The id of the merchantprovidergroup association.',
		},
		entity: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The entity associated with the merchantprovidergroup and the campaign.'
		},
		entity_type: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The associated entity\'s type.'
		},
		merchantprovidergroup: {
			type: new GraphQLNonNull(merchantprovidergroupType.graphObj),
			description: 'The merchantprovidergroup.',
			resolve: (merchantprovidergroupassociation) => {
				return merchantProviderGroupAssociationController.getMerchantProviderGroup(merchantprovidergroupassociation);
			}
		},
		campaign: {
			type: new GraphQLNonNull(campaignType.graphObj),
			description: 'The campaign.',
			resolve: (merchantprovidergroupassociation) => {
				return merchantProviderGroupAssociationController.getCampaign(merchantprovidergroupassociation).then(campaign => {
					if (!campaign) {
						du.error('MerchantProviderGroupAssociation.campaign is missing', merchantprovidergroupassociation);
					}

					return campaign;
				})
			}
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
