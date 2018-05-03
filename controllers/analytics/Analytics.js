const _ = require('lodash');
const path = require('path');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const paginationutilities = global.SixCRM.routes.include('lib', 'pagination-utilities.js');
const AnalyticsUtilities = global.SixCRM.routes.include('controllers', 'analytics/AnalyticsUtilities.js');
const CacheController = global.SixCRM.routes.include('controllers', 'providers/Cache.js');

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

		this.cacheController = new CacheController();
		this.permissionutilities = global.SixCRM.routes.include('lib', 'permission-utilities.js');

	}

	/* deprecate */

	getCampaignsByAmount(parameters) {

		du.debug('Get Campaigns By Amount');

		parameters = paginationutilities.mergePagination(parameters.analyticsfilter, paginationutilities.createSQLPaginationInput({
			limit: 10,
			order: 'desc'
		}));

		return this.getResults('deprecate/campaigns_by_amount', parameters, this.default_query_filters);

	}

	getEventFunnel(parameters) {

		du.debug('Get Event Funnel');

		return this.getResults('deprecate/event_funnel', parameters.analyticsfilter, this.default_query_filters);

	}

	getTransactionSummary(parameters) {

		du.debug('Get Transaction Summary');

		let target_period_count = this.getTargetPeriodCount(parameters.analyticsfilter);

		let period_selection = this.periodSelection(parameters.analyticsfilter.start, parameters.analyticsfilter.end, target_period_count);

		parameters = this.appendPeriod(parameters.analyticsfilter, period_selection);

		return this.getResults('deprecate/aggregation_processor_amount', parameters, this.default_query_filters);

	}

	getCurrentQueueSummary(parameters) {

		du.debug('Get Rebills current queue summary');

		const queuename = parameters.queuename;

		parameters = this.appendQueueName(parameters, queuename);

		return this.getResults('deprecate/order_engine/rebills_current_summary', parameters, [
			'account'
		]);

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
		return this.getResults('deprecate/order_engine/rebill_pagination', parameters, [
			'account'
		]);

	}

	getRebillsInQueue(parameters) {

		const queue_name = parameters.queuename;

		du.debug('Get Rebills In Queue', queue_name);

		parameters = paginationutilities.mergePagination(parameters.analyticsfilter, paginationutilities.createSQLPaginationInput(parameters.pagination));

		if (!_.isUndefined(queue_name)) {
			parameters = this.appendQueueName(parameters, queue_name);
		}

		return this.getResults('deprecate/order_engine/rebills_in_queue', parameters, this.default_query_filters);

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

	/* new methods */

	async getReportFacets(parameters) {

		const facets = parameters.filter.facets;

		const facetResponse = {
			facets: []
		};

		switch (parameters.filter.reportType) {

			default:

				if (_.includes(facets, 'affiliate')) {

					const resolveParams = require('./queries/reports/facets/affiliates/params');
					const facet = await this.query('reports/facets/affiliates', await resolveParams(parameters));
					facetResponse.facets.push(facet)

				}

				if (_.includes(facets, 'campaign')) {

					const resolveParams = require('./queries/reports/facets/campaigns/params');
					const facet = await this.query('reports/facets/campaigns', await resolveParams(parameters));
					facetResponse.facets.push(facet)

				}

				if (_.includes(facets, 'product')) {

					const resolveParams = require('./queries/reports/facets/products/params');
					const facet = await this.query('reports/facets/products', await resolveParams(parameters));
					facetResponse.facets.push(facet)

				}

				if (_.includes(facets, 'productSchedule')) {

					const resolveParams = require('./queries/reports/facets/product-schedules/params');
					const facet = await this.query('reports/facets/product-schedules', await resolveParams(parameters));
					facetResponse.facets.push(facet)

				}

				if (_.includes(facets, 'mid')) {

					const resolveParams = require('./queries/reports/facets/mids/params');
					const facet = await this.query('reports/facets/mids', await resolveParams(parameters));
					facetResponse.facets.push(facet)

				}

				if (_.includes(facets, 'subId')) {

					const resolveParams = require('./queries/reports/facets/sub-ids/params');
					const facet = await this.query('reports/facets/sub-ids', await resolveParams(parameters));
					facetResponse.facets.push(facet)

				}

				break;

		}

		return facetResponse;

	}

	async getReport(parameters) {

		du.debug('Get report', parameters.reportType);

		switch (parameters.reportType) {

			case 'revenueVersusOrders': {
				const resolveParams = require('./queries/home/hero-chart-timeseries/revenue-vs-orders/params');
				return this.query('home/hero-chart-timeseries/revenue-vs-orders', await resolveParams(parameters));
			}
			case 'ordersVersusUpsells': {
				const resolveParams = require('./queries/home/hero-chart-timeseries/orders-vs-upsells/params');
				return this.query('home/hero-chart-timeseries/orders-vs-upsells', await resolveParams(parameters));
			}
			case 'directVersusRebill': {
				const resolveParams = require('./queries/home/hero-chart-timeseries/direct-vs-rebill/params');
				return this.query('home/hero-chart-timeseries/direct-vs-rebill', await resolveParams(parameters));
			}
			case 'averageRevenuePerOrder': {
				const resolveParams = require('./queries/home/hero-chart-timeseries/average-revenue-per-order/params');
				return this.query('home/hero-chart-timeseries/average-revenue-per-order', await resolveParams(parameters));
			}
			case 'affiliateTraffic': {
				const resolveParams = require('./queries/reports/affiliate-traffic/params');
				return this.query('reports/affiliate-traffic', await resolveParams(parameters));
			}
			case 'merchantReport': {
				const resolveParams = require('./queries/reports/merchant-report/params');
				return this.query('reports/merchant-report', await resolveParams(parameters));
			}
			case 'activities': {
				const resolveParams = require('./queries/reports/activities/params');
				return this.query('reports/activities', await resolveParams(parameters, parameters.pagination));
			}
			default:
				throw new Error('Report not found');

		}

	}

	async query(queryRoot, parameters) {

		const clone = _.clone(parameters);

		if (this.permissionutilities.areACLsDisabled() !== true && global.account !== '*') {

			clone.account = global.account;

		}

		const queryTransform = require(path.join(__dirname, 'queries', queryRoot, 'query'));
		const query = await queryTransform(parameters);
		const auroraContext = global.SixCRM.getResource('auroraContext');

		// return this.cacheController.useCache(query, async () => {
		const results = await auroraContext.connection.query(query);
		const resultTransform = require(path.join(__dirname, 'queries', queryRoot, 'transform'));
		return resultTransform(results.rows);
		// });

	}

}
