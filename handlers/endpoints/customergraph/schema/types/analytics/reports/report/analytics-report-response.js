const GraphQLList = require('graphql').GraphQLList;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const AnalyticsReportDictionaryEntry = require('../common/analytics-report-dictionary-entry');
const AnalyticsReportMeta = require('./analytics-report-meta');

module.exports = new GraphQLObjectType({
	name: 'AnalyticsReportResponse',
	description: 'Table of analytics data where is each row is a dictionary',
	fields: () => ({
		meta: {
			type: AnalyticsReportMeta,
			description: 'Meta-data about the response'
		},
		records: {
			type: new GraphQLList(new GraphQLList(AnalyticsReportDictionaryEntry)),
			description: 'Records'
		}
	}),
	interfaces: []
});
