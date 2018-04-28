const _ = require('lodash');
const path = require('path');
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

	getActivityByIdentifier(args) {

		du.debug('Get Activity By Identifier');

		let parameters = paginationutilities.mergePagination(args.activityfilter, paginationutilities.createSQLPaginationInput(args.pagination));

		let this_query_filter = [
			'action',
			'actor',
			'actor_type',
			'acted_upon',
			'acted_upon_type',
			'associated_with',
			'associated_with_type',
			'account'
		];

		['actor', 'actor_type', 'acted_upon', 'acted_upon_type', 'associated_with', 'associated_with_type'].forEach((argument) => {
			this_query_filter = arrayutilities.removeElement(this_query_filter, argument);
		});

		return this.getResults('deprecate/activity_by_identifier', parameters, this_query_filter);

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

					const facet = await this.query('reports/facets/affiliates', _resolveParams());
					facetResponse.facets.push(facet)

				}

				if (_.includes(facets, 'campaign')) {

					const facet = await this.query('reports/facets/campaigns', _resolveParams());
					facetResponse.facets.push(facet)

				}

				if (_.includes(facets, 'product')) {

					const facet = await this.query('reports/facets/products', _resolveParams());
					facetResponse.facets.push(facet)

				}

				if (_.includes(facets, 'productSchedule')) {

					const facet = await this.query('reports/facets/product-schedules', _resolveParams());
					facetResponse.facets.push(facet)

				}

				if (_.includes(facets, 'mid')) {

					const facet = await this.query('reports/facets/mids', _resolveParams());
					facetResponse.facets.push(facet)

				}

				if (_.includes(facets, 'subId')) {

					const facet = await this.query('reports/facets/sub-ids', _resolveParams());
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

		du.debug('Get report', parameters.reportType);

		switch (parameters.facets.reportType) {

			case 'revenueVersusOrders':
				return this.query('home/hero-chart-timeseries/revenue-vs-orders', _resolveParams());
			case 'ordersVersusUpsells':
				return this.query('home/hero-chart-timeseries/orders-vs-upsells', _resolveParams());
			case 'directVersusRebill':
				return this.query('home/hero-chart-timeseries/direct-vs-rebill', _resolveParams());
			case 'averageRevenuePerOrder':
				return this.query('home/hero-chart-timeseries/average-revenue-per-order', _resolveParams());
			case 'affiliateTraffic':
				return this.query('reports/affiliate-traffic', _resolveParams());
			case 'merchantReport':
				return this.query('reports/merchant-report', _resolveParams());
			default:
				throw new Error('Report not found');

		}

		function _resolveParams() {

			const start = parameters.facets.facets.find(f => f.facet === 'start');
			const end = parameters.facets.facets.find(f => f.facet === 'end');
			const period = parameters.facets.facets.find(f => f.facet === 'period');
			const campaign = parameters.facets.facets.find(f => f.facet === 'campaign');
			const affiliate = parameters.facets.facets.find(f => f.facet === 'affiliate');
			const subId = parameters.facets.facets.find(f => f.facet === 'subId');
			const mid = parameters.facets.facets.find(f => f.facet === 'mid');
			const product = parameters.facets.facets.find(f => f.facet === 'product');
			const productSchedule = parameters.facets.facets.find(f => f.facet === 'productSchedule');

			const params = {
				start: start.values[0],
				end: end.values[0]
			}

			_resolveParamValue('period', period);
			_resolveParamValue('campaign', campaign);
			_resolveParamValue('affiliate', affiliate);
			_resolveParamValue('subId', subId);
			_resolveParamValue('mid', mid);
			_resolveParamValue('product', product);
			_resolveParamValue('productSchedule', productSchedule);

			return params;

			function _resolveParamValue(identifier, facet) {

				if (facet) {

					params[identifier] = facet.values[0];

				}

			}

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
