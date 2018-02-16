'use strict';
const GraphQLList = require('graphql').GraphQLList;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

const transactionsReportDetailRowType = require('./transactionsReportRowType');
const analyticsPaginationType = require('./../paginationType');

module.exports.graphObj = new GraphQLObjectType({
    name: 'TransactionsReportType',
    description: 'Transactions Report',
    fields: () => ({
      transactions: {
          type: new GraphQLList(transactionsReportDetailRowType.graphObj),
          description: 'A transaction',
      },
      pagination: {
          type: new GraphQLNonNull(analyticsPaginationType.graphObj),
          description: 'A transaction',
      }
    }),
    interfaces: []
});
