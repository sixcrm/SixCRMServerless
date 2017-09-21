'use strict';
const GraphQLList = require('graphql').GraphQLList;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLJSON = require('graphql-type-json');
const GraphQLNonNull = require('graphql').GraphQLNonNull;

const transactionReportByDayType = require('./transactionReportByDayType');
const analyticsPaginationType = require('./paginationType');

module.exports.graphObj = new GraphQLObjectType({
    name: 'TransactionReportType',
    description: 'Transaction report by day',
    fields: () => ({
      periods: {
          type: new GraphQLList(transactionReportByDayType.graphObj),
          description: 'A transaction',
      },
      pagination: {
          type: new GraphQLNonNull(analyticsPaginationType.graphObj),
          description: 'A transaction',
      }
    }),
    interfaces: []
});
