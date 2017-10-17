'use strict';
const GraphQLList = require('graphql').GraphQLList;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInt = require('graphql').GraphQLInt;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

module.exports.graphObj = new GraphQLObjectType({
    name: 'AffiliateReportSummaryType',
    description: 'Affiliate Report Summary',
    fields: () => ({
      count_click: {
        type: GraphQLString
      },
      count_partials: {
        type: GraphQLString
      },
      partials_percent: {
        type: GraphQLString
      },
      decline_count: {
        type: GraphQLString
      },
      declines_percent: {
        type: GraphQLString
      },
      count_sales: {
        type: GraphQLString
      },
      sales_percent: {
        type: GraphQLString
      },
      count_upsell: {
        type: GraphQLString
      },
      upsell_percent: {
        type: GraphQLString
      },
      sum_upsell: {
        type: GraphQLString
      },
      sum_amount: {
        type: GraphQLString
      }
    }),
    interfaces: []
});
