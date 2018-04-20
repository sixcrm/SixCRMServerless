const _ = require('lodash');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const paginationutilities = global.SixCRM.routes.include('lib', 'pagination-utilities.js');
const AnalyticsUtilities = global.SixCRM.routes.include('controllers', 'analytics/AnalyticsUtilities.js');

module.exports = class AnalyticsController extends AnalyticsUtilities {

	constructor() {

		super();

		this.default_query_filters = [
			'campaign',
			'merchant_provider',
			'affiliate',
			's1',
			's2',
			's3',
			's4',
			's5',
			'account'
		];

		this.default_activity_query_filters = [
			'action',
			'actor',
			'actor_type',
			'acted_upon',
			'acted_upon_type',
			'associated_with',
			'associated_with_type',
			'account'
		];

		this.default_bin_query_filters = [
			'binnumber',
			'brand',
			'bank',
			'type',
			'level',
			'country',
			'info',
			'country_iso',
			'country2_iso',
			'country3_iso',
			'webpage',
			'phone'
		];

		this.default_queue_account_filter = [
			'account'
		];

	}

	getCampaignsByAmount(parameters) {

		du.debug('Get Campaigns By Amount');

		parameters = paginationutilities.mergePagination(parameters.analyticsfilter, paginationutilities.createSQLPaginationInput({
			limit: 10,
			order: 'desc'
		}));

		return this.getResults('campaigns_by_amount', parameters, this.default_query_filters);

	}

	getEventFunnel(parameters) {

		du.debug('Get Event Funnel');

		return this.getResults('event_funnel', parameters.analyticsfilter, this.default_query_filters);

	}

	getTransactionSummary(parameters) {

		du.debug('Get Transaction Summary');

		let target_period_count = this.getTargetPeriodCount(parameters.analyticsfilter);

		let period_selection = this.periodSelection(parameters.analyticsfilter.start, parameters.analyticsfilter.end, target_period_count);

		parameters = this.appendPeriod(parameters.analyticsfilter, period_selection);

		return this.getResults('aggregation_processor_amount', parameters, this.default_query_filters);

	}

	getCurrentQueueSummary(parameters) {

		du.debug('Get Rebills current queue summary');

		const queuename = parameters.queuename;

		parameters = this.appendQueueName(parameters, queuename);

		return this.getResults('order_engine/rebills_current_summary', parameters, this.default_queue_account_filter);

	}

	getRebillSummary(parameters) {

		du.debug('Get Rebill Summary');

		const queue_name = parameters.queuename;
		const period = parameters.period;

		du.debug(parameters);
		parameters = paginationutilities.mergePagination(parameters.analyticsfilter, paginationutilities.createSQLPaginationInput(parameters.pagination));

		if (!_.isUndefined(queue_name)) {
			parameters = this.appendQueueName(parameters, queue_name);
		}

		parameters = this.appendPeriod(parameters, {
			name: period
		});
		du.debug(parameters);
		return this.getResults('order_engine/rebill_pagination', parameters, this.default_queue_account_filter);

	}

	getRebillsInQueue(parameters) {

		const queue_name = parameters.queuename;

		du.debug('Get Rebills In Queue', queue_name);

		parameters = paginationutilities.mergePagination(parameters.analyticsfilter, paginationutilities.createSQLPaginationInput(parameters.pagination));

		if (!_.isUndefined(queue_name)) {
			parameters = this.appendQueueName(parameters, queue_name);
		}

		return this.getResults('order_engine/rebills_in_queue', parameters, this.default_query_filters);

	}

	getAffiliateReportSubaffiliates(parameters) {

		du.debug('Get Affiliate Report Subaffiliates');

		du.debug(parameters);

		let target_period_count = this.getTargetPeriodCount(parameters.analyticsfilter);

		let period_selection = this.periodSelection(parameters.analyticsfilter.start, parameters.analyticsfilter.end, target_period_count);

		parameters = paginationutilities.mergePagination(parameters.analyticsfilter, paginationutilities.createSQLPaginationInput(parameters.pagination));

		parameters = this.appendPeriod(parameters, period_selection);

		return this.getResults('deprecate/reports/affiliate/affiliate_report_subaffiliates', parameters, this.default_query_filters);

	}

	getAffiliateReportSummary(parameters) {

		du.debug('Get Affiliate Report Summary');

		let target_period_count = this.getTargetPeriodCount(parameters.analyticsfilter);

		let period_selection = this.periodSelection(parameters.analyticsfilter.start, parameters.analyticsfilter.end, target_period_count);

		parameters = paginationutilities.mergePagination(parameters.analyticsfilter, paginationutilities.createSQLPaginationInput(parameters.pagination));

		parameters = this.appendPeriod(parameters, period_selection);

		return this.getResults('deprecate/reports/affiliate/affiliate_report_summary', parameters, this.default_query_filters);

	}

	getAffiliateReport(parameters) {

		du.debug('Get Affiliate Report');

		let target_period_count = this.getTargetPeriodCount(parameters.analyticsfilter);

		let period_selection = this.periodSelection(parameters.analyticsfilter.start, parameters.analyticsfilter.end, target_period_count);

		parameters = paginationutilities.mergePagination(parameters.analyticsfilter, paginationutilities.createSQLPaginationInput(parameters.pagination));

		parameters = this.appendPeriod(parameters, period_selection);

		return this.getResults('deprecate/reports/affiliate/affiliate_report', parameters, this.default_query_filters);

	}

	getMerchantReport(parameters) {

		du.debug('Get Merchant Report');

		let target_period_count = this.getTargetPeriodCount(parameters.analyticsfilter);

		du.debug('Get Merchant Report parameters');
		du.debug(parameters);

		let period_selection = this.periodSelection(parameters.analyticsfilter.start, parameters.analyticsfilter.end, target_period_count);

		parameters = paginationutilities.mergePagination(parameters.analyticsfilter, paginationutilities.createSQLPaginationInput(parameters.pagination));

		parameters = this.appendPeriod(parameters, period_selection);

		du.debug('Get Merchant Report parameters after merge');
		du.debug(parameters);

		return this.getResults('deprecate/reports/merchantprovider/merchantprovider_report', parameters, this.default_query_filters);

	}

	getActivityByIdentifier(args) {

		du.debug('Get Activity By Identifier');

		let activity_filter = this.getActivityFilter(args);

		let pagination = this.getPagination(args);

		let parameters = paginationutilities.mergePagination(activity_filter, paginationutilities.createSQLPaginationInput(pagination));

		let this_query_filter = this.default_activity_query_filters;

		['actor', 'actor_type', 'acted_upon', 'acted_upon_type', 'associated_with', 'associated_with_type'].forEach((argument) => {
			this_query_filter = arrayutilities.removeElement(this_query_filter, argument);
		});

		return this.getResults('activity_by_identifier', parameters, this_query_filter);

	}

	async getReportFacets(parameters) {

		const facets = parameters.filter.facets;

		const facetResponse = {
			facets: []
		};

		switch (parameters.filter.reportType) {

		default:

			if (_.includes(facets, 'affiliate')) {

				const facet = await this.getResults('reports/affiliate/facets/affiliates', _resolveParams(), this.default_queue_account_filter);
				facetResponse.facets.push(facet)

			}

			if (_.includes(facets, 'campaign')) {

				const facet = await this.getResults('reports/affiliate/facets/campaigns', _resolveParams(), this.default_queue_account_filter);
				facetResponse.facets.push(facet)

			}

			if (_.includes(facets, 'product')) {

				const facet = await this.getResults('reports/affiliate/facets/products', _resolveParams(), this.default_queue_account_filter);
				facetResponse.facets.push(facet)

			}

			if (_.includes(facets, 'productSchedule')) {

				const facet = await this.getResults('reports/affiliate/facets/product-schedules', _resolveParams(), this.default_queue_account_filter);
				facetResponse.facets.push(facet)

			}

			if (_.includes(facets, 'mid')) {

				const facet = await this.getResults('reports/affiliate/facets/mids', _resolveParams(), this.default_queue_account_filter);
				facetResponse.facets.push(facet)

			}

			if (_.includes(facets, 'subId')) {

				const facet = await this.getResults('reports/affiliate/facets/sub-ids', _resolveParams(), this.default_queue_account_filter);
				facetResponse.facets.push(facet)

			}

			break;

		}

		return facetResponse;

		function _resolveParams() {

			const start = parameters.filter.filters.find(f => f.facet === 'start');
			const end = parameters.filter.filters.find(f => f.facet === 'end');

			const params = {
				start: start.values[0],
				end: end.values[0]
			}

			return params;

		}

	}

	async getReport(parameters) {

		du.debug('Get home chart timeseries');

		switch (parameters.facets.reportType) {

		case 'revenueVersusOrders':
			return this.getResults('home/hero-chart-timeseries/revenue-vs-orders', _resolveParams(), this.default_queue_account_filter);
		case 'ordersVersusUpsells':
			return this.getResults('home/hero-chart-timeseries/orders-vs-upsells', _resolveParams(), this.default_queue_account_filter);
		case 'directVersusRebill':
			return this.getResults('home/hero-chart-timeseries/direct-vs-rebill', _resolveParams(), this.default_queue_account_filter);
		case 'averageRevenuePerOrder':
			return this.getResults('home/hero-chart-timeseries/average-revenue-per-order', _resolveParams(), this.default_queue_account_filter);
		default:
			throw new Error('Report not found');

		}

		function _resolveParams() {

			const start = parameters.facets.facets.find(f => f.facet === 'start');
			const end = parameters.facets.facets.find(f => f.facet === 'end');
			const period = parameters.facets.facets.find(f => f.facet === 'period');
			const campaign = parameters.facets.facets.find(f => f.facet === 'campaign');

			const params = {
				start: start.values[0],
				end: end.values[0],
				period: period.values[0]
			}

			if (campaign) {

				params.campaign = campaign.values[0];

			}

			return params;

		}

	}

	getPagination(parameters) {

		if (_.has(parameters, 'pagination')) {
			return parameters.pagination;
		}

		return null;

	}

	getActivityFilter(parameters) {

		if (_.has(parameters, 'activityfilter')) {
			return parameters.activityfilter;
		}

		return null;

	}

}
