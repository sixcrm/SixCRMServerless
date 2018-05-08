const _ = require('lodash');
const path = require('path');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const AnalyticsUtilities = global.SixCRM.routes.include('controllers', 'analytics/AnalyticsUtilities.js');
const CacheController = global.SixCRM.routes.include('controllers', 'providers/Cache.js');

module.exports = class AnalyticsController extends AnalyticsUtilities {

	constructor() {

		super();

		this.cacheController = new CacheController();
		this.permissionutilities = global.SixCRM.routes.include('lib', 'permission-utilities.js');

	}

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
			case 'eventFunnel': {
				const resolveParams = require('./queries/reports/event-funnel/params');
				return this.query('reports/event-funnel', await resolveParams(parameters));
			}
			case 'eventFunnelTimeseries': {
				const resolveParams = require('./queries/reports/event-funnel-timeseries/params');
				return this.query('reports/event-funnel-timeseries', await resolveParams(parameters));
			}
			case 'campaignsByAmount': {
				const resolveParams = require('./queries/reports/campaigns-by-amount/params');
				return this.query('reports/campaigns-by-amount', await resolveParams(parameters, parameters.pagination));
			}
			case 'transactionSummary': {
				const resolveParams = require('./queries/reports/transaction-summary/params');
				return this.query('reports/transaction-summary', await resolveParams(parameters));
			}
			case 'rebillSummary': {
				const resolveParams = require('./queries/reports/rebill-summary/params');
				return this.query('reports/rebill-summary', await resolveParams(parameters, parameters.pagination));
			}
			case 'rebillsInQueue': {
				const resolveParams = require('./queries/reports/rebills-in-queue/params');
				return this.query('reports/rebills-in-queue', await resolveParams(parameters, parameters.pagination));
			}
			case 'rebillsCurrent': {
				const resolveParams = require('./queries/reports/rebills-current/params');
				return this.query('reports/rebills-current', await resolveParams(parameters));
			}
			default:
				throw new Error('Report not found');

		}

	}

	async query(queryRoot, parameters) {

		const clone = _.clone(parameters);

		if (!this.permissionutilities.areACLsDisabled() && global.account !== '*') {

			clone.account = global.account;

		}

		const queryTransform = require(path.join(__dirname, 'queries', queryRoot, 'query'));
		const query = await queryTransform(clone);
		const auroraContext = global.SixCRM.getResource('auroraContext');

		// return this.cacheController.useCache(query, async () => {
		const results = await auroraContext.connection.query(query);
		const resultTransform = require(path.join(__dirname, 'queries', queryRoot, 'transform'));
		return resultTransform(results.rows);
		// });

	}

}
