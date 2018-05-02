const AnalyticsReportResponse = require('../analytics/reports/report/analytics-report-response');
const AnalyticsReportFacetsRequest = require('../analytics/reports/facets/analytics-report-facets-request');
const AnalyticsReportFacetsResponse = require('../analytics/reports/facets/analytics-report-facets-response');
const AnalyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');
const AnalyticsReportSelector = require('./reports/common/analytics-report-selector');
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLList = require('graphql').GraphQLList;
const AnalyticsReportInputFacetType = require('./reports/report/analytics-report-request-facet');
const AnayticsReportRequestPagination = require('./reports/report/analytics-report-request-pagination');

module.exports = {

	analytics: {
		type: AnalyticsReportResponse,
		args: {
			reportType: {
				type: new GraphQLNonNull(AnalyticsReportSelector),
				description: 'The type of the analytics report'
			},
			facets: {
				type: new GraphQLList(AnalyticsReportInputFacetType),
				description: 'Facets'
			},
			pagination: {
				type: AnayticsReportRequestPagination,
				description: 'Pagination'
			}
		},
		resolve: function (root, args) {

			const analyticsController = new AnalyticsController();
			return analyticsController.executeAnalyticsFunction(args, 'getReport');

		}
	},

	analyticsfacets: {
		type: AnalyticsReportFacetsResponse,
		args: {
			filter: {
				type: AnalyticsReportFacetsRequest
			}
		},
		resolve: function (root, args) {

			const analyticsController = new AnalyticsController();
			return analyticsController.executeAnalyticsFunction(args, 'getReportFacets');

		}
	}

}
