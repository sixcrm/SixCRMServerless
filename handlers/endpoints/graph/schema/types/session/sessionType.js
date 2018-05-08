
const GraphQLList = require('graphql').GraphQLList;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLBoolean = require('graphql').GraphQLBoolean;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;

let sessionInterface = require('./sessionInterface');
let campaignType = require('../campaign/campaignType');
let affiliateType = require('../affiliate/affiliateType');
let rebillType = require('../rebill/rebillType');
let productScheduleType = require('../productschedule/productScheduleType');
let customerType = require('../customer/customerType');
let watermarkType = require('./watermark/watermarkType');
let sessionCancelType = require('./sessionCancelType')

const SessionController = global.SixCRM.routes.include('entities', 'Session.js');
const sessionController = new SessionController();

module.exports.graphObj = new GraphQLObjectType({
	name: 'Session',
	description: 'A record denoting a customer, a group of products and corresponding transactions.',
	fields: () => ({
		id: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The id of the session.',
		},
		alias:{
			type: GraphQLString,
			description: 'The alias of the session'
		},
		customer: {
			type: customerType.graphObj,
			description: 'The customer record that the session references.',
			resolve: session => sessionController.getCustomer(session),
		},
		watermark:{
			type: watermarkType.graphObj,
			description: 'The session watermark'
		},
		product_schedules: {
			type: new GraphQLList(productScheduleType.graphObj),
			description: 'The product schedules associated with the session',
			resolve: session => sessionController.listProductSchedules(session).then(results => sessionController.getResult(results,'productschedules')),
		},
		rebills: {
			type: new GraphQLList(rebillType.graphObj),
			description: 'The rebills associated with the session',
			resolve: function(session){
				return sessionController.listRebills(session);
			}
		},
		campaign: {
			type: campaignType.graphObj,
			description: 'The campaign associated with the session',
			resolve: function(session){
				return sessionController.getCampaign(session);
			}
		},
		affiliate:{
			type: affiliateType.graphObj,
			description: 'The affiliate associated with the session',
			resolve: function(session){
				return sessionController.getAffiliate(session, 'affiliate');
			}
		},
		subaffiliate_1:{
			type: affiliateType.graphObj,
			description: 'The subaffiliate_1 associated with the session',
			resolve: function(session){
				return sessionController.getAffiliate(session, 'subaffiliate_1');
			}
		},
		subaffiliate_2:{
			type: affiliateType.graphObj,
			description: 'The subaffiliate_2 associated with the session',
			resolve: function(session){
				return sessionController.getAffiliate(session, 'subaffiliate_2');
			}
		},
		subaffiliate_3:{
			type: affiliateType.graphObj,
			description: 'The subaffiliate_3 associated with the session',
			resolve: function(session){
				return sessionController.getAffiliate(session, 'subaffiliate_3');
			}
		},
		subaffiliate_4:{
			type: affiliateType.graphObj,
			description: 'The subaffiliate_4 associated with the session',
			resolve: function(session){
				return sessionController.getAffiliate(session, 'subaffiliate_4');
			}
		},
		subaffiliate_5:{
			type: affiliateType.graphObj,
			description: 'The subaffiliate_5 associated with the session',
			resolve: function(session){
				return sessionController.getAffiliate(session, 'subaffiliate_5');
			}
		},
		cid:{
			type: affiliateType.graphObj,
			description: 'The cid associated with the session',
			resolve: function(session){
				return sessionController.getAffiliate(session, 'cid');
			}
		},
		cancelled: {
			type: sessionCancelType.graphObj,
			description: 'A an object with information about the sessions cancelled state, who cancelled and when.',
		},
		completed: {
			type: new GraphQLNonNull(GraphQLBoolean),
			description: 'A boolean denoting that that session has otherwise been completed or expired.',
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
	interfaces: [sessionInterface.graphObj]
});
