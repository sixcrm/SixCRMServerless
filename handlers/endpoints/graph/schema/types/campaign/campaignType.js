'use strict';
const GraphQLList = require('graphql').GraphQLList;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLBoolean = require('graphql').GraphQLBoolean;

let emailTemplateType = require('../emailtemplate/emailTemplateType');
let affiliateAllowDenyType = require('../affiliate/affiliateAllowDenyType');
let productScheduleType = require('../productschedule/productScheduleType');
let loadbalancerAssociationType = require('../loadbalancerassociation/loadBalancerAssociationType');

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
              var campaignController = global.SixCRM.routes.include('controllers', 'entities/Campaign.js');

              return campaignController.getProductSchedules(campaign);
          }
      },
      emailtemplates: {
          type: new GraphQLList(emailTemplateType.graphObj),
          descsription: 'Email templates configured and associated with the campaign',
          resolve: (campaign) => {
              var campaignController = global.SixCRM.routes.include('controllers', 'entities/Campaign.js');

              return campaignController.getEmailTemplates(campaign);
          }
      },
      affiliate_allow: {
        type: new GraphQLList(affiliateAllowDenyType.graphObj),
        description: 'The affiliate allow list on this campaign.',
        resolve: (campaign) => {
          var campaignController = global.SixCRM.routes.include('controllers', 'entities/Campaign.js');

          return campaignController.getAffiliateAllowDenyList(campaign.affiliate_allow);
        }
      },
      affiliate_deny: {
        type: new GraphQLList(affiliateAllowDenyType.graphObj),
        description: 'The affiliate deny list on this campaign.',
        resolve: (campaign) => {
          var campaignController = global.SixCRM.routes.include('controllers', 'entities/Campaign.js');

          return campaignController.getAffiliateAllowDenyList(campaign.affiliate_deny);
        }
      },
      loadbalancer_associations: {
        type: new GraphQLList(loadbalancerAssociationType.graphObj),
        description: 'The load balancer association list on this campaign.',
        resolve: (campaign) => {
          const loadbalancerAssociationController = global.SixCRM.routes.include('controllers', 'entities/LoadBalancerAssociation.js');

          return loadbalancerAssociationController.listByEntitiesAndCampaign({entities: [campaign.id], campaign: campaign})
            .then((result) => result.loadbalancerassociations);
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
