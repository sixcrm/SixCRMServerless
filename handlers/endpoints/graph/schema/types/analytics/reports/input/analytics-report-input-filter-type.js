const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLEnumType = require('graphql').GraphQLEnumType;
const GraphQLList = require('graphql').GraphQLList;
const AnalyticsReportInputFacetType = require('./analytics-report-input-facet-type');

module.exports = new GraphQLInputObjectType({
	name: 'AnalyticsReportInputFilterType',
	fields: () => ({
		facets: {
			type: new GraphQLList(AnalyticsReportInputFacetType),
			description: 'Facets'
		},
		reportType: {
			type: new GraphQLNonNull(AnalyticsReportSelectorType),
			description: 'The type of the analytics report'
		},
	})
});

const AnalyticsReportSelectorType = new GraphQLEnumType({
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
