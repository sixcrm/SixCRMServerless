'use strict';
const GraphQLList = require('graphql').GraphQLList;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLJSON = require('graphql-type-json');
const GraphQLNonNull = require('graphql').GraphQLNonNull;

const merchantReportRowType = require('./merchantReportRowType');
const analyticsPaginationType = require('./../paginationType');

module.exports.graphObj = new GraphQLObjectType({
    name: 'MerchantReportType',
    description: 'Merchant Report',
    fields: () => ({
      merchants: {
          type: new GraphQLList(merchantReportRowType.graphObj),
          description: 'A transaction',
      },
      pagination: {
          type: new GraphQLNonNull(analyticsPaginationType.graphObj),
          description: 'A transaction',
      }
    }),
    interfaces: []
});
