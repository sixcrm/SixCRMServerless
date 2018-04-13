const AnalyticsReportRequest = require('../analytics/reports/report/analytics-report-request');
const AnalyticsReportResponse = require('../analytics/reports/report/analytics-report-response');
const AnalyticsReportFacetsRequest = require('../analytics/reports/facets/analytics-report-facets-request');
const AnalyticsReportFacetsResponse = require('../analytics/reports/facets/analytics-report-facets-response');
const AnalyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');

module.exports = {

	analytics: {
		type: AnalyticsReportResponse,
		args: {
			facets: {
				type: AnalyticsReportRequest
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
			facets: {
				type: AnalyticsReportFacetsRequest
			}
		},
		resolve: function (root, args) {

			const analyticsController = new AnalyticsController();
			return analyticsController.executeAnalyticsFunction(args, 'getReportFacets');

		}
	}

}
