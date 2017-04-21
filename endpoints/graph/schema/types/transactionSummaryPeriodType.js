'use strict';
const GraphQLList = require('graphql').GraphQLList;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const transactionSummaryPeriodProcessorResultType = require('./TransactionSummaryPeriodProcessorResultType');

module.exports.graphObj = new GraphQLObjectType({
    name: 'TransactionSummaryPeriodType',
    description: 'Transaction summary',
    fields: () => ({
        datetime: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The period datetime (end) for the summary.',
        },
        byprocessorresult: {
            type: new GraphQLList(transactionSummaryPeriodProcessorResultType.graphObj),
            description: 'A transaction period processor result summary.',
        },
    }),
    interfaces: []
});
