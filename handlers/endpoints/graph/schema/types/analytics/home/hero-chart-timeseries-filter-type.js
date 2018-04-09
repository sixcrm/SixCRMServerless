const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLEnumType = require('graphql').GraphQLEnumType;

module.exports = new GraphQLInputObjectType({
	name: 'HeroChartTimeseriesFilterType',
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
		comparisonType: {
			type: new GraphQLNonNull(HeroChartTimeseriesComparisonType),
			description: 'The type of graph comparison, default is revenue versus orders'
		},
		campaign: {
			type: GraphQLString,
			description: 'Campaign id'
		}
	})
});

const HeroChartTimeseriesComparisonType = new GraphQLEnumType({
	name: 'HeroChartTimeseriesComparisonType',
	values: {
		revenueVersusOrders: {
			value: 'revenueVersusOrders'
		},
		ordersVersusUpsells: {
			value: 'ordersVersusUpsells'
		},
		directVersusRebill: {
			value: 'directVersusRebill'
		},
		averageRevenuePerOrder: {
			value: 'averageRevenuePerOrder'
		}
	}
})