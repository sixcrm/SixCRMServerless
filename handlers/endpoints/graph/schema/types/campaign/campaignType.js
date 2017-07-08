'use strict';
const GraphQLList = require('graphql').GraphQLList;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLString = require('graphql').GraphQLString;

let emailTemplateType = require('../emailtemplate/emailTemplateType');
let affiliateAllowDenyType = require('../affiliate/affiliateAllowDenyType');
let productScheduleType = require('../productschedule/productScheduleType');

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
      productschedules: {
          type: new GraphQLList(productScheduleType.graphObj),
          description: 'The configured product schedules associated with the campaign',
          resolve: (campaign) => {
              var campaignController = global.routes.include('controllers', 'entities/Campaign.js');

              return campaignController.getProductSchedules(campaign);
          }
      },
      emailtemplates: {
          type: new GraphQLList(emailTemplateType.graphObj),
          descsription: 'Email templates configured and associated with the campaign',
          resolve: (campaign) => {
              var campaignController = global.routes.include('controllers', 'entities/Campaign.js');

              return campaignController.getEmailTemplates(campaign);
          }
      },
      affiliate_allow: {
        type: new GraphQLList(affiliateAllowDenyType.graphObj),
        description: 'The affiliate allow list on this campaign.',
        resolve: (campaign) => {
          var campaignController = global.routes.include('controllers', 'entities/Campaign.js');

          return campaignController.getAffiliateAllowDenyList(campaign.affiliate_allow);
        }
      },
      affiliate_deny: {
        type: new GraphQLList(affiliateAllowDenyType.graphObj),
        description: 'The affiliate deny list on this campaign.',
        resolve: (campaign) => {
          var campaignController = global.routes.include('controllers', 'entities/Campaign.js');

          return campaignController.getAffiliateAllowDenyList(campaign.affiliate_deny);
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
