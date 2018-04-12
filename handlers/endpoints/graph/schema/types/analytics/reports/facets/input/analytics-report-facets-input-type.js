const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLString = require('graphql').GraphQLString;
const AnalyticsReportSelectionType = require('../../analytics-report-selection-type');

module.exports = new GraphQLInputObjectType({
	name: 'AnalyticsReportInputFilterType',
	fields: () => ({
		facets: {
			type: new GraphQLList(GraphQLString),
			description: 'Facets'
		},
		reportType: {
			type: new GraphQLNonNull(AnalyticsReportSelectionType),
			description: 'The type of the analytics report'
		},
	})
});
