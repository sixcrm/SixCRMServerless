'use strict';
const GraphQLList = require('graphql').GraphQLList;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInt = require('graphql').GraphQLInt;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

const affiliateController = global.SixCRM.routes.include('controllers', 'entities/Affiliate.js');
const affiliateType = require('./../../affiliate/affiliateType');

module.exports.graphObj = new GraphQLObjectType({
    name: 'AffiliateReportSubaffiliateRowType',
    description: 'Affiliate Report Subaffiliate Row',
    fields: () => ({
      affiliate:{
        type: affiliateType.graphObj,
        description: 'The affiliate',
        resolve: (row) => {
          return affiliateController.get({id: row.affiliate});
        }
      },
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
