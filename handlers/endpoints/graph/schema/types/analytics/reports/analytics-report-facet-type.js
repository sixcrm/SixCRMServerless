const GraphQLString = require('graphql').GraphQLString;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const AnalyticsReportDictionaryEntryType = require('./analytics-report-dictionary-entry-type');

module.exports = new GraphQLObjectType({
	name: 'AnayticsReportFacetType',
	description: 'Facet',
	fields: () => ({
		facet: {
			type: GraphQLString
		},
		values: {
			type: new GraphQLList(AnalyticsReportDictionaryEntryType)
		}
	}),
	interfaces: []
});
