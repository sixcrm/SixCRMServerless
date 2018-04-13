const GraphQLString = require('graphql').GraphQLString;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const AnalyticsReportDictionaryEntry = require('./analytics-report-dictionary-entry');

module.exports = new GraphQLObjectType({
	name: 'AnayticsReportFacetType',
	description: 'Facet',
	fields: () => ({
		facet: {
			type: GraphQLString
		},
		values: {
			type: new GraphQLList(AnalyticsReportDictionaryEntry)
		}
	}),
	interfaces: []
});
