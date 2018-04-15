
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

let campaignType = require('../campaign/campaignType');
const CampaignController = global.SixCRM.routes.include('controllers', 'entities/Campaign.js');
const campaignController = new CampaignController();

module.exports.graphObj = new GraphQLObjectType({
	name: 'CampaingDeltaGroupType',
	description: 'The campaign delta campaigns',
	fields: () => ({
		campaign:{
			type: campaignType.graphObj,
			description: 'The campaign',
			resolve: (delta) => {
				return campaignController.get({id: delta.campaign});
			}
		},
		percent_change_amount:{
			type: new GraphQLNonNull(GraphQLString),
			description: 'The percent change (currency)'
		},
		percent_change_count:{
			type: new GraphQLNonNull(GraphQLString),
			description: 'The percent change (amount)'
		}
	}),
	interfaces: []
});
