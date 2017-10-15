'use strict';
const GraphQLList = require('graphql').GraphQLList;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLJSON = require('graphql-type-json');
const GraphQLNonNull = require('graphql').GraphQLNonNull;

const transactionsReportDetailRowType = require('./transactionsReportDetailRowType');
const analyticsPaginationType = require('./../paginationType');

module.exports.graphObj = new GraphQLObjectType({
    name: 'TransactionsReportDetailType',
    description: 'Transactions Report Detail',
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
