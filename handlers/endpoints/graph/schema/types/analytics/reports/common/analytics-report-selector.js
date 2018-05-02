const GraphQLEnumType = require('graphql').GraphQLEnumType;

module.exports = new GraphQLEnumType({
	name: 'AnalyticsReportSelector',
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
		},
		affiliateTraffic: {
			value: 'affiliateTraffic'
		},
		merchantReport: {
			value: 'merchantReport'
		},
		activities: {
			value: 'activities'
		}
	}
})
