let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');

describe('controllers/Analytics.js', () => {

	before(() => {
		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
	});

	afterEach(() => {
		mockery.resetCache();
		mockery.deregisterAll();
	});

	describe('getActivityFilter', () => {

		it('returns null when activity filter is not set', () => {

			let AnalyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');
			const analyticsController = new AnalyticsController();

			expect(analyticsController.getActivityFilter({})).to.equal(null);
		});

		it('successfully returns activity filter', () => {

			let params = {
				activityfilter: 'an_activity_filter'
			};

			let AnalyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');
			const analyticsController = new AnalyticsController();

			expect(analyticsController.getActivityFilter(params)).to.equal(params.activityfilter);
		});
	});

	describe('getPagination', () => {

		it('returns null when pagination is not set', () => {

			let AnalyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');
			const analyticsController = new AnalyticsController();

			expect(analyticsController.getPagination({})).to.equal(null);
		});

		it('successfully returns pagination', () => {

			let params = {
				pagination: 'any_pagination'
			};

			let AnalyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');
			const analyticsController = new AnalyticsController();

			expect(analyticsController.getPagination(params)).to.equal(params.pagination);
		});
	});

	describe('getActivityByIdentifier', () => {

		it('successfully returns activity by identifier', () => {

			let params = {
				activityfilter: {
					an_activity_filter: 'an_activity_filter'
				},
				pagination: {
					order: 'sample data'
				}
			};

			let mock_analytics_utilities = class {
				constructor() {
				}

				getResults(query_name, parameters, query_filters) {
					expect(query_name).to.equal('activity_by_identifier');
					expect(parameters).to.deep.equal({
						an_activity_filter: params.activityfilter.an_activity_filter,
						order: params.pagination.order,
						offset: 0,
						limit: 50
					});
					expect(query_filters).to.deep.equal(['action', 'account']);
					return Promise.resolve('any_results')
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'analytics/AnalyticsUtilities.js'), mock_analytics_utilities);

			let AnalyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');
			const analyticsController = new AnalyticsController();

			return analyticsController.getActivityByIdentifier(params).then((result) => {
				expect(result).to.equal('any_results');
			});
		});
	});

	describe('getCampaignsByAmount', () => {

		it('successfully returns campaigns by amount', () => {

			let params = {
				analyticsfilter: {
					an_analytics_filter: 'an_analytics_filter'
				}
			};

			let mock_analytics_utilities = class {
				constructor() {
				}

				getResults(query_name, parameters, query_filters) {
					expect(query_name).to.equal('campaigns_by_amount');
					expect(parameters).to.deep.equal({
						an_analytics_filter: params.analyticsfilter.an_analytics_filter,
						order: 'desc',
						offset: 0,
						limit: 10
					});
					expect(query_filters).to.be.defined;
					return Promise.resolve('any_results')
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'analytics/AnalyticsUtilities.js'), mock_analytics_utilities);

			let AnalyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');
			const analyticsController = new AnalyticsController();

			return analyticsController.getCampaignsByAmount(params).then((result) => {
				expect(result).to.equal('any_results');
			});
		});
	});

	describe('getEventFunnel', () => {

		it('successfully returns event funnel', () => {

			let params = {
				analyticsfilter: 'an_analytics_filter'
			};

			let mock_analytics_utilities = class {
				constructor() {
				}

				getResults(query_name, parameters, query_filters) {
					expect(query_name).to.equal('event_funnel');
					expect(parameters).to.equal(params.analyticsfilter);
					expect(query_filters).to.be.defined;
					return Promise.resolve('any_results')
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'analytics/AnalyticsUtilities.js'), mock_analytics_utilities);

			let AnalyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');
			const analyticsController = new AnalyticsController();

			return analyticsController.getEventFunnel(params).then((result) => {
				expect(result).to.equal('any_results');
			});
		});
	});

});
