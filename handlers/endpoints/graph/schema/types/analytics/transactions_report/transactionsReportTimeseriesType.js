'use strict';
const GraphQLList = require('graphql').GraphQLList;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLJSON = require('graphql-type-json');
const GraphQLNonNull = require('graphql').GraphQLNonNull;

const transactionsReportTimeseriesRowType = require('./transactionsReportTimeseriesRowType');
const analyticsPaginationType = require('./../paginationType');

module.exports.graphObj = new GraphQLObjectType({
    name: 'TransactionsReportTimeseriesType',
    description: 'Transactions Report Timeseries',
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
