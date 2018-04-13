const GraphQLString = require('graphql').GraphQLString;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const AnalyticsReportAny = require('./analytics-report-any');

module.exports = new GraphQLObjectType({
	name: 'AnayticsReportDictionaryEntry',
	description: 'Dictionary entry',
	fields: () => ({
		key: {
			type: GraphQLString
		},
		value: {
			type: AnalyticsReportAny
		}
	}),
	interfaces: []
});
