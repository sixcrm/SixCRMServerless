const GraphQLString = require('graphql').GraphQLString;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;
const AnalyticsReportAny= require('../common/analytics-report-any');

module.exports = new GraphQLInputObjectType({
	name: 'AnayticsReportRequestFacet',
	description: 'Facet',
	fields: () => ({
		facet: {
			type: GraphQLString
		},
		values: {
			type: new GraphQLList(AnalyticsReportAny)
		}
	})
});
