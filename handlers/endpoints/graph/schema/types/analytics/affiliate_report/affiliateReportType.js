
const GraphQLList = require('graphql').GraphQLList;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

const affiliateReportRowType = require('./affiliateReportRowType');
const analyticsPaginationType = require('./../paginationType');

module.exports.graphObj = new GraphQLObjectType({
  name: 'AffiliateReportType',
  description: 'Affiliates Report Type',
  fields: () => ({
    affiliates: {
      type: new GraphQLList(affiliateReportRowType.graphObj),
      description: 'A affiliate'
    },
    pagination: {
      type: new GraphQLNonNull(analyticsPaginationType.graphObj),
      description: ''
    }
  }),
  interfaces: []
});
