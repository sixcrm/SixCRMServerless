let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');

describe('controllers/AnalyticsUtilities.js', () => {

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

    describe('getTargetPeriodCount', () => {

        it('returns default target period count when target period count is not specified', () => {

            let AnalyticsUtilitiesController = global.SixCRM.routes.include('controllers', 'analytics/AnalyticsUtilities.js');
            let analyticsUtilitiesController = new AnalyticsUtilitiesController();

            expect(analyticsUtilitiesController.getTargetPeriodCount({})).to.equal(30);
        });

        it('returns target period count', () => {
            let params = {
                targetperiodcount: 1 //any number
            };

            let AnalyticsUtilitiesController = global.SixCRM.routes.include('controllers', 'analytics/AnalyticsUtilities.js');
            let analyticsUtilitiesController = new AnalyticsUtilitiesController();

            expect(analyticsUtilitiesController.getTargetPeriodCount(params)).to.equal(1);
        });
    });

    describe('appendQueueName', () => {

        it('successfully appends queue name', () => {

            let params = {};

            let queuename = 'a_queue_name';

            let AnalyticsUtilitiesController = global.SixCRM.routes.include('controllers', 'analytics/AnalyticsUtilities.js');
            let analyticsUtilitiesController = new AnalyticsUtilitiesController();

            expect(analyticsUtilitiesController.appendQueueName(params, queuename)).to.deep.equal({
                queuename: "'" + queuename + "'"
            });
        });
    });

    describe('appendCurrentQueueName', () => {

        it('successfully appends current queue name', () => {

            let params = {};

            let queue_name = 'a_queue_name';

            let AnalyticsUtilitiesController = global.SixCRM.routes.include('controllers', 'analytics/AnalyticsUtilities.js');
            let analyticsUtilitiesController = new AnalyticsUtilitiesController();

            expect(analyticsUtilitiesController.appendCurrentQueueName(params, queue_name)).to.deep.equal({
                current_queuename: "'" + queue_name + "'"
            });
        });
    });

    describe('appendPeriod', () => {

        it('successfully appends period', () => {

            let params = {};

            let period = {
                name: 'a_name'
            };

            let AnalyticsUtilitiesController = global.SixCRM.routes.include('controllers', 'analytics/AnalyticsUtilities.js');
            let analyticsUtilitiesController = new AnalyticsUtilitiesController();

            expect(analyticsUtilitiesController.appendPeriod(params, period)).to.deep.equal({
                period: period.name
            });
        });
    });

    describe('setCacheSettings', () => {

        it('successfully sets cache settings', () => {

            let params = {
                cache: {
                    use_cache: false
                }
            };

            let mock_cache = class {
                constructor(){}

                setDisable(setting) {
                    expect(setting).to.equal(true);
                }
            };

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/Cache.js'), mock_cache);

            let AnalyticsUtilitiesController = global.SixCRM.routes.include('controllers', 'analytics/AnalyticsUtilities.js');
            let analyticsUtilitiesController = new AnalyticsUtilitiesController();

            analyticsUtilitiesController.setCacheSettings(params);
        });
    });

    describe('disableACLs/enableACLs', () => {

        let temp_disableactionchecks;
        let temp_disableaccountfilter;

        before(() => {
            temp_disableactionchecks = global.disableactionchecks;
            temp_disableaccountfilter = global.disableaccountfilter;
        });

        after(() => {
            global.disableactionchecks = temp_disableactionchecks;
            global.disableaccountfilter = temp_disableaccountfilter;
        });

        it('disableACLs', () => {

            let AnalyticsUtilitiesController = global.SixCRM.routes.include('controllers', 'analytics/AnalyticsUtilities.js');
            let analyticsUtilitiesController = new AnalyticsUtilitiesController();

            analyticsUtilitiesController.disableACLs();

            expect(global.disableactionchecks).to.be.true;
            expect(global.disableaccountfilter).to.be.true;
        });

        it('enableACLs', () => {

            let AnalyticsUtilitiesController = global.SixCRM.routes.include('controllers', 'analytics/AnalyticsUtilities.js');
            let analyticsUtilitiesController = new AnalyticsUtilitiesController();

            analyticsUtilitiesController.enableACLs();

            expect(global.disableactionchecks).to.be.false;
            expect(global.disableaccountfilter).to.be.false;
        });
    });

    describe('periodSelection', () => {

        it('returns hour as selected period', () => {

            let start = "2018-01-09T10:40:41.405Z";

            let end = "2018-01-09T11:42:45.405Z";

            let target_period_count = 1; //any number

            let AnalyticsUtilitiesController = global.SixCRM.routes.include('controllers', 'analytics/AnalyticsUtilities.js');
            let analyticsUtilitiesController = new AnalyticsUtilitiesController();

            expect(analyticsUtilitiesController.periodSelection(start, end, target_period_count)).to.deep.equal({
                name: 'hour',
                seconds: 3600
            });
        });

        it('returns week as selected period', () => {

            let start = "2018-01-01T10:40:41.405Z";

            let end = "2018-01-09T11:42:45.405Z";

            let target_period_count = 1; //any number

            let AnalyticsUtilitiesController = global.SixCRM.routes.include('controllers', 'analytics/AnalyticsUtilities.js');
            let analyticsUtilitiesController = new AnalyticsUtilitiesController();

            expect(analyticsUtilitiesController.periodSelection(start, end, target_period_count)).to.deep.equal({
                name: 'week',
                seconds: 604800
            });
        });

        it('returns year as selected period', () => {

            let start = "2016-12-21T10:40:41.405Z";

            let end = "2018-01-09T11:42:45.405Z";

            let target_period_count = 1; //any number

            let AnalyticsUtilitiesController = global.SixCRM.routes.include('controllers', 'analytics/AnalyticsUtilities.js');
            let analyticsUtilitiesController = new AnalyticsUtilitiesController();

            expect(analyticsUtilitiesController.periodSelection(start, end, target_period_count)).to.deep.equal({
                name: 'year',
                seconds: 30412800
            });
        });
    });
});
