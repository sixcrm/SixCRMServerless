const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLString = require('graphql').GraphQLString;
const AnalyticsReportSelector = require('../common/analytics-report-selector');
const AnalyticsReportInputFacet = require('../report/analytics-report-request-facet');

module.exports = new GraphQLInputObjectType({
	name: 'AnalyticsReportFacetsRequest',
	fields: () => ({
		filters: {
			type: new GraphQLList(AnalyticsReportInputFacet),
			description: 'Filters to retrieve facet values'
		},
		facets: {
			type: new GraphQLList(GraphQLString),
			description: 'Facets to fetch'
		},
		reportType: {
			type: new GraphQLNonNull(AnalyticsReportSelector),
			description: 'The type of the analytics report'
		},
	})
});
