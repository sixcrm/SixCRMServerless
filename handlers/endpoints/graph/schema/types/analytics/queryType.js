const AnalyticsReportInputFilterType = require('../analytics/reports/input/analytics-report-input-filter-type');
const AnalyticsReportTableType = require('../analytics/reports/analytics-report-table-type');

const AnalyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');

module.exports = {
	analytics: {
		type: AnalyticsReportTableType,
		args: {
			analyticsfacets: {
				type: AnalyticsReportInputFilterType
			}
		},
		resolve: function (root, args) {

			const analyticsController = new AnalyticsController();
			return analyticsController.executeAnalyticsFunction(args, 'getReport');

		}
	},

	// analyticsfacets: {
	// 	type: AnalyticsReportTableType,
	// 	args: {
	// 		analyticsfacets: {
	// 			type: AnalyticsReportInputFilterType
	// 		}
	// 	},
	// 	resolve: function(root, args) {

	// 		const analyticsController = new AnalyticsController();
	// 		return analyticsController.executeAnalyticsFunction(args, 'getReport');

	// 	}
	// }

}
