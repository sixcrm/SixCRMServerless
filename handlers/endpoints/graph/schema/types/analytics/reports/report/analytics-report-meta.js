const GraphQLInt = require('graphql').GraphQLInt;
const GraphQLObjectType = require('graphql').GraphQLObjectType;

module.exports = new GraphQLObjectType({
	name: 'AnalyticsReportMeta',
	description: 'Meta data for response',
	fields: () => ({
		count: {
			type: GraphQLInt,
			description: 'Count'
		}
	}),
	interfaces: []
});
