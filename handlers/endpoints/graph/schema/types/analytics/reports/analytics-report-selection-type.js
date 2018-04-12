const GraphQLEnumType = require('graphql').GraphQLEnumType;

module.exports = new GraphQLEnumType({
	name: 'AnalyticsReportSelectorType',
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
