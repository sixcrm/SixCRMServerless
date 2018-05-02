const GraphQLList = require('graphql').GraphQLList;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const AnalyticsReportDictionaryEntry = require('../common/analytics-report-dictionary-entry');

module.exports = new GraphQLObjectType({
	name: 'AnalyticsReportMeta',
	description: 'Meta data for response',
	fields: () => ({
		count: {
			type: new GraphQLList(new GraphQLList(AnalyticsReportDictionaryEntry)),
			description: 'Records'
		}
	}),
	interfaces: []
});
