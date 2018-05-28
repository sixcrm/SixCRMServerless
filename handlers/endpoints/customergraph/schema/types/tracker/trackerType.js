const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLList = require('graphql').GraphQLList;

let affiliateType = require('../affiliate/affiliateType');
let campaignType = require('../campaign/campaignType');
const TrackerController = global.SixCRM.routes.include('controllers', 'entities/Tracker.js');
const trackerController = new TrackerController();

module.exports.graphObj = new GraphQLObjectType({
	name: 'Tracker',
	description: 'A tracker.',
	fields: () => ({
		id: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The id of the tracker.',
		},
		campaigns: {
			type: new GraphQLList(campaignType.graphObj),
			description: 'The associated campaign entities.',
			resolve: tracker => {
				return trackerController.getCampaigns(tracker);
			}
		},
		affiliates: {
			type: new GraphQLList(affiliateType.graphObj),
			description: 'The associated affiliate entities.',
			resolve: (tracker) => {
				return trackerController.getAffiliates(tracker);
			}
		},
		type: {
			type: new GraphQLNonNull(GraphQLString),
			description: '.',
		},
		event_type: {
			type: new GraphQLList(GraphQLString),
			description: ''
		},
		name: {
			type: GraphQLString,
			description: '.',
		},
		body: {
			type: new GraphQLNonNull(GraphQLString),
			description: '.',
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
