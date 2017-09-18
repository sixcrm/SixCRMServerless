'use strict';
const GraphQLList = require('graphql').GraphQLList;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;

let sessionInterface = require('./sessionInterface');
let campaignType = require('../campaign/campaignType');
let affiliateType = require('../affiliate/affiliateType');
let rebillType = require('../rebill/rebillType');
let productScheduleType = require('../productschedule/productScheduleType');
let customerType = require('../customer/customerType');

const sessionController = global.SixCRM.routes.include('controllers', 'entities/Session.js');

module.exports.graphObj = new GraphQLObjectType({
    name: 'Session',
    description: 'A record denoting a customer, a group of products and corresponding transactions.',
    fields: () => ({
        id: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The id of the session.',
        },
        customer: {
            type: customerType.graphObj,
            description: 'The customer record that the session references.',
            resolve: session => sessionController.getCustomer(session),
        },
        product_schedules: {
            type: new GraphQLList(productScheduleType.graphObj),
            description: 'The product schedules associated with the session',
            resolve: session => sessionController.getProductSchedules(session),
        },
        rebills: {
            type: new GraphQLList(rebillType.graphObj),
            description: 'The rebills associated with the session',
            resolve: function(session){
              return sessionController.listRebillsRaw(session);
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
        completed: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'A boolean string denoting that that session has otherwise been completed or expired.',
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
