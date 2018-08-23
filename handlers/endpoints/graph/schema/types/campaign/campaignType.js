const _ = require('lodash');
const GraphQLList = require('graphql').GraphQLList;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLBoolean = require('graphql').GraphQLBoolean;

var CampaignController = global.SixCRM.routes.include('controllers', 'entities/Campaign.js');
const MerchantProviderGroupAssociationController = global.SixCRM.routes.include('controllers', 'entities/MerchantProviderGroupAssociation.js');

let emailTemplateType = require('../emailtemplate/emailTemplateType');
let affiliateAllowDenyType = require('../affiliate/affiliateAllowDenyType');
let productScheduleType = require('../productschedule/productScheduleType');
let merchantprovidergroupAssociationType = require('../merchantprovidergroupassociation/merchantProviderGroupAssociationType');

const EmailTemplateController = global.SixCRM.routes.include('controllers', 'entities/EmailTemplate.js');
const emailTemplateController = new EmailTemplateController();

module.exports.graphObj = new GraphQLObjectType({
	name: 'campaign',
	description: 'A camapign.',
	fields: () => ({
		id: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The id of the campaign.',
		},
		name: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The name of the campaign.',
		},
		description: {
			type: GraphQLString,
			description: 'The description of the campaign.',
		},
		allow_on_order_form: {
			type: new GraphQLNonNull(GraphQLBoolean),
			description: 'Allow this campaign to be used in order creation.'
		},
		allow_prepaid: {
			type: new GraphQLNonNull(GraphQLBoolean),
			description: 'Allow prepaid on the campaign.'
		},
		show_prepaid: {
			type: new GraphQLNonNull(GraphQLBoolean),
			description: 'Show prepaid on the campaign to affiliates.'
		},
		productschedules: {
			type: new GraphQLList(productScheduleType.graphObj),
			description: 'The configured product schedules associated with the campaign',
			resolve: (campaign) => {
				const campaignController = new CampaignController();

				return campaignController.getProductSchedules(campaign);
			}
		},
		emailtemplates: {
			type: new GraphQLList(emailTemplateType.graphObj),
			description: 'Email templates configured and associated with the campaign',
			resolve: (campaign) => {
				return emailTemplateController.listByCampaign(campaign)
			}
		},
		affiliate_allow: {
			type: new GraphQLList(affiliateAllowDenyType.graphObj),
			description: 'The affiliate allow list on this campaign.',
			resolve: (campaign) => {
				const campaignController = new CampaignController();

				return campaignController.getAffiliateAllowDenyList(campaign.affiliate_allow);
			}
		},
		affiliate_deny: {
			type: new GraphQLList(affiliateAllowDenyType.graphObj),
			description: 'The affiliate deny list on this campaign.',
			resolve: (campaign) => {
				const campaignController = new CampaignController();

				return campaignController.getAffiliateAllowDenyList(campaign.affiliate_deny);
			}
		},
		merchantprovidergroup_associations: {
			type: new GraphQLList(merchantprovidergroupAssociationType.graphObj),
			description: 'The merchant provider group association list on this campaign.',
			resolve: (campaign) => {
				const merchantprovidergroupAssociationController = new MerchantProviderGroupAssociationController();

				return merchantprovidergroupAssociationController.listByEntitiesAndCampaign({
					entities: [campaign.id],
					campaign: campaign
				})
					.then((result) => {
						if(_.has(result, 'merchantprovidergroupassociations')){
							return result.merchantprovidergroupassociations;
						}
						return null;
					});
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
