'use strict';
const GraphQLList = require('graphql').GraphQLList;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLJSON = require('graphql-type-json');
const GraphQLNonNull = require('graphql').GraphQLNonNull;

module.exports.graphObj = new GraphQLObjectType({
    name: 'TransactionsReportSummaryType',
    description: 'Transactions Report Timeseries',
    fields: () => ({
      period: {
        type: GraphQLString
      },
      sale_count: {
        type: GraphQLString
      },
      sale_revenue: {
        type: GraphQLString
      },
      rebill_count: {
        type: GraphQLString
      },
      rebill_revenue: {
        type: GraphQLString
      },
      refund_expenses: {
        type: GraphQLString
      },
      refund_count: {
        type: GraphQLString
      },
      gross_revenue: {
        type: GraphQLString
      },
      declines_count: {
        type: GraphQLString
      },
      declines_revenue: {
        type: GraphQLString
      },
      chargeback_count: {
        type: GraphQLString
      },
      current_active_customer: {
        type: GraphQLString
      },
      count_alert_count: {
        type: GraphQLString
      }
    }),
    interfaces: []
});
