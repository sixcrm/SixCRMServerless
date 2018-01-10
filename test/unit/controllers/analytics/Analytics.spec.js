let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');

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

            let analyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');

            expect(analyticsController.getActivityFilter({})).to.equal(null);
        });

        it('successfully returns activity filter', () => {

            let params = {
                activityfilter: 'an_activity_filter'
            };

            let analyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');

            expect(analyticsController.getActivityFilter(params)).to.equal(params.activityfilter);
        });
    });

    describe('getPagination', () => {

        it('returns null when pagination is not set', () => {

            let analyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');

            expect(analyticsController.getPagination({})).to.equal(null);
        });

        it('successfully returns pagination', () => {

            let params = {
                pagination: 'any_pagination'
            };

            let analyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');

            expect(analyticsController.getPagination(params)).to.equal(params.pagination);
        });
    });

    describe('getActivity', () => {

        it('successfully returns activity', () => {

            let params = {
                activityfilter: {
                    an_activity_filter: 'an_activity_filter'
                },
                pagination: {
                    order: 'sample data'
                }
            };

            let mock_analytics_utilities = class {
                constructor(){}

                getResults(query_name, parameters, query_filters) {
                    expect(query_name).to.equal('activity');
                    expect(parameters).to.deep.equal({
                        an_activity_filter: params.activityfilter.an_activity_filter,
                        order: params.pagination.order,
                        offset: 0,
                        limit: 50
                    });
                    expect(query_filters).to.be.defined;
                    return Promise.resolve('any_results')
                }
            };

            mockery.registerMock(global.SixCRM.routes.path('controllers','analytics/AnalyticsUtilities.js'), mock_analytics_utilities);

            let analyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');

            return analyticsController.getActivity(params).then((result) => {
                expect(result).to.equal('any_results');
            });
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
                constructor(){}

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

            mockery.registerMock(global.SixCRM.routes.path('controllers','analytics/AnalyticsUtilities.js'), mock_analytics_utilities);

            let analyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');

            return analyticsController.getActivityByIdentifier(params).then((result) => {
                expect(result).to.equal('any_results');
            });
        });
    });

    describe('getCampaignDelta', () => {

        it('successfully returns campaign delta', () => {

            let params = {
                analyticsfilter: {
                    an_analytics_filter: 'an_analytics_filter'
                }
            };

            let mock_analytics_utilities = class {
                constructor(){}

                getResults(query_name, parameters, query_filters) {
                    expect(query_name).to.equal('campaign_delta');
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

            mockery.registerMock(global.SixCRM.routes.path('controllers','analytics/AnalyticsUtilities.js'), mock_analytics_utilities);

            let analyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');

            return analyticsController.getCampaignDelta(params).then((result) => {
                expect(result).to.equal('any_results');
            });
        });
    });

    describe('getTransactionsReport', () => {

        it('successfully returns transactions report', () => {

            let params = {
                analyticsfilter: {
                    an_analytics_filter: 'an_analytics_filter'
                },
                pagination: {
                    order: 'sample data'
                }
            };

            let mock_analytics_utilities = class {
                constructor(){}

                getResults(query_name, parameters, query_filters) {
                    expect(query_name).to.equal('reports/transactions/transactions_report');
                    expect(parameters).to.deep.equal({
                        an_analytics_filter: params.analyticsfilter.an_analytics_filter,
                        order: params.pagination.order,
                        offset: 0,
                        limit: 50
                    });
                    expect(query_filters).to.be.defined;
                    return Promise.resolve('any_results')
                }
            };

            mockery.registerMock(global.SixCRM.routes.path('controllers','analytics/AnalyticsUtilities.js'), mock_analytics_utilities);

            let analyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');

            return analyticsController.getTransactionsReport(params).then((result) => {
                expect(result).to.equal('any_results');
            });
        });
    });

    describe('getTransactionOverview', () => {

        it('successfully returns transaction overview', () => {

            let params = {
                analyticsfilter: 'an_analytics_filter'
            };

            let mock_analytics_utilities = class {
                constructor(){}

                getResults(query_name, parameters, query_filters) {
                    expect(query_name).to.equal('transaction_summary');
                    expect(parameters).to.equal(params.analyticsfilter);
                    expect(query_filters).to.be.defined;
                    return Promise.resolve('any_results')
                }
            };

            mockery.registerMock(global.SixCRM.routes.path('controllers','analytics/AnalyticsUtilities.js'), mock_analytics_utilities);

            let analyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');

            return analyticsController.getTransactionOverview(params).then((result) => {
                expect(result).to.equal('any_results');
            });
        });
    });

    describe('getTransactionsByFacet', () => {

        it('successfully returns transaction by facet', () => {

            let params = {
                analyticsfilter: {
                    an_analytics_filter: 'an_analytics_filter'
                },
                pagination: {
                    order: 'sample data'
                },
                facet: 'a_facet'
            };

            let mock_analytics_utilities = class {
                constructor(){}

                getResults(query_name, parameters, query_filters) {
                    expect(query_name).to.equal('transactions_by_facet');
                    expect(parameters).to.deep.equal({
                        an_analytics_filter: params.analyticsfilter.an_analytics_filter,
                        order: params.pagination.order,
                        offset: 0,
                        limit: 50,
                        facet: params.facet
                    });
                    expect(query_filters).to.be.defined;
                    return Promise.resolve('any_results')
                }
            };

            mockery.registerMock(global.SixCRM.routes.path('controllers','analytics/AnalyticsUtilities.js'), mock_analytics_utilities);

            let analyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');

            return analyticsController.getTransactionsByFacet(params).then((result) => {
                expect(result).to.equal('any_results');
            });
        });
    });

    describe('getEventsByFacet', () => {

        it('successfully returns events by facet', () => {

            let params = {
                analyticsfilter: {
                    an_analytics_filter: 'an_analytics_filter'
                },
                pagination: {
                    order: 'sample data'
                },
                facet: 'a_facet'
            };

            let mock_analytics_utilities = class {
                constructor(){}

                getResults(query_name, parameters, query_filters) {
                    expect(query_name).to.equal('events_by_facet');
                    expect(parameters).to.deep.equal({
                        an_analytics_filter: params.analyticsfilter.an_analytics_filter,
                        order: params.pagination.order,
                        offset: 0,
                        limit: 50,
                        facet: params.facet
                    });
                    expect(query_filters).to.be.defined;
                    return Promise.resolve('any_results')
                }
            };

            mockery.registerMock(global.SixCRM.routes.path('controllers','analytics/AnalyticsUtilities.js'), mock_analytics_utilities);

            let analyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');

            return analyticsController.getEventsByFacet(params).then((result) => {
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
                constructor(){}

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

            mockery.registerMock(global.SixCRM.routes.path('controllers','analytics/AnalyticsUtilities.js'), mock_analytics_utilities);

            let analyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');

            return analyticsController.getCampaignsByAmount(params).then((result) => {
                expect(result).to.equal('any_results');
            });
        });
    });

    describe('getEvents', () => {

        it('successfully returns events', () => {

            let params = {
                analyticsfilter: {
                    an_analytics_filter: 'an_analytics_filter'
                },
                pagination: {
                    order: 'sample data'
                }
            };

            let mock_analytics_utilities = class {
                constructor(){}

                getResults(query_name, parameters, query_filters) {
                    expect(query_name).to.equal('events');
                    expect(parameters).to.deep.equal({
                        an_analytics_filter: params.analyticsfilter.an_analytics_filter,
                        order: params.pagination.order,
                        offset: 0,
                        limit: 50
                    });
                    expect(query_filters).to.be.defined;
                    return Promise.resolve('any_results')
                }
            };

            mockery.registerMock(global.SixCRM.routes.path('controllers','analytics/AnalyticsUtilities.js'), mock_analytics_utilities);

            let analyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');

            return analyticsController.getEvents(params).then((result) => {
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
                constructor(){}

                getResults(query_name, parameters, query_filters) {
                    expect(query_name).to.equal('event_funnel');
                    expect(parameters).to.equal(params.analyticsfilter);
                    expect(query_filters).to.be.defined;
                    return Promise.resolve('any_results')
                }
            };

            mockery.registerMock(global.SixCRM.routes.path('controllers','analytics/AnalyticsUtilities.js'), mock_analytics_utilities);

            let analyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');

            return analyticsController.getEventFunnel(params).then((result) => {
                expect(result).to.equal('any_results');
            });
        });
    });

    describe('getTransactions', () => {

        it('successfully returns transactions', () => {

            let params = {
                analyticsfilter: {
                    an_analytics_filter: 'an_analytics_filter'
                },
                pagination: {
                    order: 'sample data'
                }
            };

            let mock_analytics_utilities = class {
                constructor(){}

                getResults(query_name, parameters, query_filters) {
                    expect(query_name).to.equal('transactions');
                    expect(parameters).to.deep.equal({
                        an_analytics_filter: params.analyticsfilter.an_analytics_filter,
                        order: params.pagination.order,
                        offset: 0,
                        limit: 50
                    });
                    expect(query_filters).to.be.defined;
                    return Promise.resolve('any_results')
                }
            };

            mockery.registerMock(global.SixCRM.routes.path('controllers','analytics/AnalyticsUtilities.js'), mock_analytics_utilities);

            let analyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');

            return analyticsController.getTransactions(params).then((result) => {
                expect(result).to.equal('any_results');
            });
        });
    });

    describe('getBINList', () => {

        it('successfully returns BIN list', () => {

            let params = {
                binfilter: {
                    a_binfilter: 'a_binfilter'
                },
                pagination: {
                    order: 'sample data'
                }
            };

            let mock_analytics_utilities = class {
                constructor(){}

                getResults(query_name, parameters, query_filters) {
                    expect(query_name).to.equal('bin');
                    expect(parameters).to.deep.equal({
                        a_binfilter: params.binfilter.a_binfilter,
                        order: params.pagination.order,
                        offset: 0,
                        limit: 50
                    });
                    expect(query_filters).to.be.defined;
                    return Promise.resolve('any_results')
                }
            };

            mockery.registerMock(global.SixCRM.routes.path('controllers','analytics/AnalyticsUtilities.js'), mock_analytics_utilities);

            let analyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');

            return analyticsController.getBINList(params).then((result) => {
                expect(result).to.equal('any_results');
            });
        });
    });
});