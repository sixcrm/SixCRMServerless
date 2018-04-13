const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLList = require('graphql').GraphQLList;
const AnalyticsReportInputFacetType = require('./analytics-report-request-facet');
const AnalyticsReportSelector= require('../common/analytics-report-selector');

module.exports = new GraphQLInputObjectType({
	name: 'AnalyticsReportRequest',
	fields: () => ({
		facets: {
			type: new GraphQLList(AnalyticsReportInputFacetType),
			description: 'Facets'
		},
		reportType: {
			type: new GraphQLNonNull(AnalyticsReportSelector),
			description: 'The type of the analytics report'
		},
	})
});
