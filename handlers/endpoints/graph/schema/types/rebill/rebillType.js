'use strict';
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

let transactionType = require('../transaction/transactionType');
let productScheduleType = require('../productschedule/productScheduleType');
let sessionType = require('../session/sessionType');
let rebillStateHistoryItem = require('./rebillStateHistoryItemType');

const rebillController = global.SixCRM.routes.include('controllers', 'entities/Rebill.js');

module.exports.graphObj = new GraphQLObjectType({
    name: 'Rebill',
    description: 'A record denoting a rebill.',
    fields: () => ({
        id: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The id of the transaction.',
        },
        bill_at: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The date of the rebill.',
        },
        amount: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The amount of the rebill.',
        },
        parentsession: {
            type: sessionType.graphObj,
            description: 'The session associated with the transaction.',
            resolve: rebill => rebillController.getParentSession(rebill),
        },
        product_schedules: {
            type: new GraphQLList(productScheduleType.graphObj),
            description:
        'The product schedules associated with the rebill',
            resolve: rebill => rebillController.listProductSchedules(rebill),
        },
        transactions: {
	          type: new GraphQLList(transactionType.graphObj),
            description: 'The transactions associated with the rebill',
            resolve: rebill => rebillController.listTransactions(rebill),
        },
        created_at: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'ISO8601 datetime when the entity was created.',
        },
        updated_at: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'ISO8601 datetime when the entity was updated.',
        },
        state: {
            type: GraphQLString,
            description: 'State rebill is currently in.',
        },
        previous_state: {
            type: GraphQLString,
            description: 'State rebill is currently in.',
        },
        state_changed_at: {
            type: GraphQLString,
            description: 'ISO8601 datetime when the state of the rebill was changed.',
        },
        history: {
            type: new GraphQLList(rebillStateHistoryItem.graphObj),
            description: 'State history of the rebill',
        },
    }),
    interfaces: []
});
