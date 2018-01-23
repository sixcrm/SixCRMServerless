'use strict';
const GraphQLList = require('graphql').GraphQLList;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInt = require('graphql').GraphQLInt;
const GraphQLNonNull = require('graphql').GraphQLNonNull;


const merchantProviderController = global.SixCRM.routes.include('controllers', 'entities/MerchantProvider.js');
const merchantProviderType = require('./../../merchantprovider/merchantProviderType');

module.exports.graphObj = new GraphQLObjectType({
    name: 'MerchantReportRowType',
    description: 'Merchant Report Row',
    fields: () => ({
      merchant_provider: {
        type: merchantProviderType.graphObj,
        description: 'The merchant provider',
        resolve: (row) => {
          return merchantProviderController.get({id: row.merchant_provider});
        }
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
