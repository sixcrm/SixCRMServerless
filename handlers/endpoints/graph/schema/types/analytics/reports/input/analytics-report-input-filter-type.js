const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLList = require('graphql').GraphQLList;
const AnalyticsReportInputFacetType = require('./analytics-report-input-facet-type');
const AnalyticsReportSelectionType = require('../analytics-report-selection-type');

module.exports = new GraphQLInputObjectType({
	name: 'AnalyticsReportInputFilterType',
	fields: () => ({
		facets: {
			type: new GraphQLList(AnalyticsReportInputFacetType),
			description: 'Facets'
		},
		reportType: {
			type: new GraphQLNonNull(AnalyticsReportSelectionType),
			description: 'The type of the analytics report'
		},
	})
});
