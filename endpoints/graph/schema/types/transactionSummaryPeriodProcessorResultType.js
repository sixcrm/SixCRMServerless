'use strict';
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLInt = require('graphql').GraphQLInt;
const GraphQLFloat = require('graphql').GraphQLFloat;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLObjectType = require('graphql').GraphQLObjectType;

module.exports.graphObj = new GraphQLObjectType({
    name: 'TransactionSummaryPeriodProcessorResultType',
    description: 'Transaction summary period processor result.',
    fields: () => ({
        processor_result:{
            type: new GraphQLNonNull(GraphQLString),
            description: 'Processor response type.',
        },
        sum:{
            type: new GraphQLNonNull(GraphQLFloat),
            description: 'The dollar sum of the transactions processed.',
        },
        count:{
            type: new GraphQLNonNull(GraphQLInt),
            description: 'The transaction count of the product.',
        }
    }),
    interfaces: []
});
