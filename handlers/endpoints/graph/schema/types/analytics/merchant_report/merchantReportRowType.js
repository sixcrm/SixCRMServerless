'use strict';
const GraphQLList = require('graphql').GraphQLList;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInt = require('graphql').GraphQLInt;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

module.exports.graphObj = new GraphQLObjectType({
    name: 'MerchantReportRowType',
    description: 'Merchant Report Row',
    fields: () => ({
      merchant_provider: {
        type: GraphQLString
      },
      sale_count: {
        type: GraphQLString
      },
      sale_gross_revenue: {
        type: GraphQLString
      },
      refund_expenses: {
        type: GraphQLString
      },
      refund_count: {
        type: GraphQLString
      },
      net_revenue: {
        type: GraphQLString
      },
      mtd_sales_count: {
        type: GraphQLString
      },
      mtd_gross_count: {
        type: GraphQLString
      }
    }),
    interfaces: []
});
