'use strict';
const GraphQLList = require('graphql').GraphQLList;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

const transactionsReportTimeseriesRowType = require('./transactionSummaryReportRowType');
const analyticsPaginationType = require('./../paginationType');

module.exports.graphObj = new GraphQLObjectType({
    name: 'TransactionSummaryReportType',
    description: 'Transaction Summary Report',
    fields: () => ({
      periods: {
          type: new GraphQLList(transactionsReportTimeseriesRowType.graphObj),
          description: 'A transaction',
      },
      pagination: {
          type: new GraphQLNonNull(analyticsPaginationType.graphObj),
          description: 'A transaction',
      }
    }),
    interfaces: []
});
