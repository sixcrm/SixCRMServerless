'use strict';
const GraphQLList = require('graphql').GraphQLList;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const listTransactionsTransactionType = require('./listTransactionsTransactionType');
const analyticsPaginationType = require('./analyticsPaginationType');

module.exports.graphObj = new GraphQLObjectType({
    name: 'listTransactionsType',
    description: 'Transactions List',
    fields: () => ({
        transactions: {
            type: new GraphQLList(listTransactionsTransactionType.graphObj),
            description: 'A transaction',
        },
        pagination: {
            type: new GraphQLList(analyticsPaginationType.graphObj),
            description: 'A transaction',
        }
    }),
    interfaces: []
});
