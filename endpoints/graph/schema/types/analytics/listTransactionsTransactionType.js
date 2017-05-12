'use strict';
const GraphQLList = require('graphql').GraphQLList;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;

module.exports.graphObj = new GraphQLObjectType({
    name: 'listTransactionsTransactionType',
    description: 'A record denoting a transaction.',
    fields: () => ({
        id: {
            type: new GraphQLNonNull(GraphQLString),
            description: ''
        },
        datetime: {
            type: new GraphQLNonNull(GraphQLString),
            description: ''
        },
        customer: {
            type: new GraphQLNonNull(GraphQLString),
            description: ''
        },
        creditcard: {
            type: new GraphQLNonNull(GraphQLString),
            description: ''
        },
        merchant_provider: {
            type: new GraphQLNonNull(GraphQLString),
            description: ''
        },
        campaign: {
            type: new GraphQLNonNull(GraphQLString),
            description: ''
        },
        affiliate: {
            type: GraphQLString,
            description: ''
        },
        amount: {
            type: new GraphQLNonNull(GraphQLString),
            description: ''
        },
        processor_result: {
            type: new GraphQLNonNull(GraphQLString),
            description: ''
        },
        account: {
            type: new GraphQLNonNull(GraphQLString),
            description: ''
        },
        transaction_type: {
            type: new GraphQLNonNull(GraphQLString),
            description: ''
        },
        product_schedule: {
            type: new GraphQLNonNull(GraphQLString),
            description: ''
        },
        subaffiliate_1: {
            type: GraphQLString,
            description: ''
        },
        subaffiliate_2: {
            type: GraphQLString,
            description: ''
        },
        subaffiliate_3: {
            type: GraphQLString,
            description: ''
        },
        subaffiliate_4: {
            type: GraphQLString,
            description: ''
        },
        subaffiliate_5: {
            type: GraphQLString,
            description: ''
        },
        transaction_subtype: {
            type: new GraphQLNonNull(GraphQLString),
            description: ''
        }
    }),
    interfaces: []
});
