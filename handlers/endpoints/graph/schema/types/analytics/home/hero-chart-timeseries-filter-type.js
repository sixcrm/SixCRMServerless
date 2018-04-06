const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

module.exports = new GraphQLInputObjectType({
	name: 'heroChartTimeseriesFilterType',
	fields: () => ({
		start: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'UTC ISO8601'
		},
		end: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'UTC ISO8601'
		},
		period: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'Values: day or month'
		},
		campaign: {
			type: GraphQLString,
			description: 'Campaign id'
		}
	})
});