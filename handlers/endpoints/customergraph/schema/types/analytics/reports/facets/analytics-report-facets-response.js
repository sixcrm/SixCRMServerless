const GraphQLList = require('graphql').GraphQLList;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const AnalyticsReportFacet = require('../common/analytics-report-facet');

module.exports = new GraphQLObjectType({
	name: 'AnayticsReportFacetsResponse',
	description: 'Facet',
	fields: () => ({
		facets: {
			type: new GraphQLList(AnalyticsReportFacet)
		}
	}),
	interfaces: []
});
