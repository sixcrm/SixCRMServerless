'use strict';
const GraphQLList = require('graphql').GraphQLList;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLString = require('graphql').GraphQLString;
//const transactionSummaryPeriodType = require('./transactionSummaryPeriodType');

module.exports.graphObj = new GraphQLObjectType({
    name: 'MerchantProcessorAmountType',
    description: 'Merchant Processor Amounts',
    fields: () => ({
        hello: {
            type: GraphQLString,
            description: 'Placeholder',
        }
    }),
    interfaces: []
});
