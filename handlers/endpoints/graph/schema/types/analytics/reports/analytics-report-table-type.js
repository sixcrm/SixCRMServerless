const GraphQLList = require('graphql').GraphQLList;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const AnalyticsReportDictionaryEntryType = require('./analytics-report-dictionary-entry-type');

module.exports = new GraphQLObjectType({
	name: 'AnalyticsReportTableType',
	description: 'Table of analytics data where is each row is a dictionary',
	fields: () => ({
		records: {
			type: new GraphQLList(new GraphQLList(AnalyticsReportDictionaryEntryType)),
			description: 'Records'
		}
	}),
	interfaces: []
});
