const GraphQLString = require('graphql').GraphQLString;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const AnalyticsReportAnyType = require('./analytics-report-any-type');

module.exports = new GraphQLObjectType({
	name: 'AnayticsReportDictionaryEntryType',
	description: 'Dictionary entry',
	fields: () => ({
		key: {
			type: GraphQLString
		},
		value: {
			type: AnalyticsReportAnyType
		}
	}),
	interfaces: []
});
