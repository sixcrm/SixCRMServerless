const GraphQLList = require('graphql').GraphQLList;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const AnalyticsReportDictionaryEntry = require('../common/analytics-report-dictionary-entry');

module.exports = new GraphQLObjectType({
	name: 'AnalyticsReportResponse',
	description: 'Table of analytics data where is each row is a dictionary',
	fields: () => ({
		records: {
			type: new GraphQLList(new GraphQLList(AnalyticsReportDictionaryEntry)),
			description: 'Records'
		}
	}),
	interfaces: []
});
