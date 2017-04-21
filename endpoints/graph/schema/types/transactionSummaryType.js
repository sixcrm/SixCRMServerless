'use strict';
const GraphQLList = require('graphql').GraphQLList;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const transactionSummaryPeriodType = require('./transactionSummaryPeriodType');

module.exports.graphObj = new GraphQLObjectType({
    name: 'TransactionSummaryType',
    description: 'Transaction summary',
    fields: () => ({
        transaction_summary: {
            type: new GraphQLList(transactionSummaryPeriodType.graphObj),
            description: 'The transaction period summaries',
        }
    }),
    interfaces: []
});
