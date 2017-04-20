const GraphQLList = require('graphql').GraphQLList;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLString = require('graphql').GraphQLString;
const campaignController = require('../../../../controllers/Campaign.js');
let emailTemplateType = require('./emailTemplateType');
let loadBalancerType = require('./loadBalancerType');
let productScheduleType = require('./productScheduleType');

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
        loadbalancer: {
            type: loadBalancerType.graphObj,
            description: 'The loadbalancer for the campaign.',
            resolve: campaign => campaignController.getLoadBalancer(campaign)
        },
        productschedules: {
            type: new GraphQLList(productScheduleType.graphObj),
            description: 'The configured product schedules associated with the campaign',
            resolve: campaign => campaignController.getProductSchedules(campaign)
        },
        emailtemplates: {
            type: new GraphQLList(emailTemplateType.graphObj),
            descsription: 'Email templates configured and associated with the campaign',
            resolve: campaign => campaignController.getEmailTemplates(campaign)
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
