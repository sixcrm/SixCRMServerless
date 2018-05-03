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
					expect(query_name).to.equal('deprecate/campaigns_by_amount');
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
					expect(query_name).to.equal('deprecate/event_funnel');
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
