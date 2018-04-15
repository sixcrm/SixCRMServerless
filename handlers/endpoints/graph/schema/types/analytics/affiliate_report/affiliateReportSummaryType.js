
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLString = require('graphql').GraphQLString;

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
      fail_count: {
        type: GraphQLString
      },
      fail_percent: {
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
