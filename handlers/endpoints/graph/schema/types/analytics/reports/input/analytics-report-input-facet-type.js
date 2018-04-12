const GraphQLString = require('graphql').GraphQLString;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;
const AnalyticsReportAnyType = require('../analytics-report-any-type');

module.exports = new GraphQLInputObjectType({
	name: 'AnayticsReportInputFacetType',
	description: 'Facet',
	fields: () => ({
		facet: {
			type: GraphQLString
		},
		values: {
			type: new GraphQLList(AnalyticsReportAnyType)
		}
	})
});
