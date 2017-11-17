let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
const TrackerHelperController = global.SixCRM.routes.include('helpers', 'entities/tracker/Tracker.js');

describe('controllers/helpers/entities/tracker/Tracker.js', () => {

    before(() => {
        mockery.enable({
            useCleanCache: true,
            warnOnReplace: false,
            warnOnUnregistered: false
        });
    });

    afterEach(() => {
        mockery.resetCache();
    });

    after(() => {
        mockery.deregisterAll();
    });

    describe('executeAffiliatesTracking', () => {

        it('returns null when there aren\'t any affiliate identifiers', () => {

            let affiliate_ids = [];

            let data = 'Some sample data';

            const trackerHelperController = new TrackerHelperController();

            return trackerHelperController.executeAffiliatesTracking(affiliate_ids, data).then((result) => {
                expect(result).to.equal(null);
            });

        });

        it('successfully executes affiliates tracking', () => {

            let affiliate_ids = ['6b6331f6-7f84-437a-9ac6-093ba301e455'];

            let data = 'Some sample data';

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Tracker.js'), {
                listByAffiliate: () => {
                    return Promise.resolve([{type: 'postback'}]);
                },
                executePostback: () => {
                    return Promise.resolve('sample transaction execution');
                }
            });

            const trackerHelperController = new TrackerHelperController();

            return trackerHelperController.executeAffiliatesTracking(affiliate_ids, data).then((result) => {
                expect(result).to.deep.equal([['sample transaction execution']]);
            });
        });
    });

    describe('executeAffiliateTrackers', () => {

        it('returns null when there aren\'t any trackers associated with this affiliate', () => {

            let affiliate_id = '6b6331f6-7f84-437a-9ac6-093ba301e455';

            let data = 'Some sample data';

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Tracker.js'), {
                listByAffiliate: () => {
                    return Promise.resolve('not an array');
                }
            });

            const trackerHelperController = new TrackerHelperController();

            return trackerHelperController.executeAffiliateTrackers(affiliate_id, data).then((result) => {
                expect(result).to.equal(null);
            });
        });

        it('successfully executes affiliate trackers', () => {

            let affiliate_id = '6b6331f6-7f84-437a-9ac6-093ba301e455';

            let data = 'Some sample data';

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Tracker.js'), {
                listByAffiliate: () => {
                    return Promise.resolve([{type: 'postback'}]);
                },
                executePostback: () => {
                    return Promise.resolve('sample transaction execution');
                }
            });

            const trackerHelperController = new TrackerHelperController();

            return trackerHelperController.executeAffiliateTrackers(affiliate_id, data).then((result) => {
                expect(result).to.deep.equal(['sample transaction execution']);
            });
        });
    });

    describe('executeTracker', () => {

        it('successfully executes tracker when type is postback', () => {

            let tracker = {type: 'postback'};

            let data = 'Some sample data';

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Tracker.js'), {
                executePostback: () => {
                    return Promise.resolve('sample transaction execution');
                }
            });

            const trackerHelperController = new TrackerHelperController();

            return trackerHelperController.executeTracker(tracker, data).then((result) => {
                expect(result).to.equal('sample transaction execution');
            });
        });

        it('returns null when tracker has HTML type', () => {

            let tracker = {type: 'html'};

            let data = 'Some sample data';

            const trackerHelperController = new TrackerHelperController();

            return trackerHelperController.executeTracker(tracker, data).then((result) => {
                expect(result).to.equal(null);
            });
        });

        it('returns null when tracker has HTML type', () => {

            let tracker = {type: 'unexpected type'};

            let data = 'Some sample data';

            const trackerHelperController = new TrackerHelperController();

            return trackerHelperController.executeTracker(tracker, data)
                .catch(error => expect(error.message).to.equal('[500] Unrecognized Tracker type: unexpected type'));
        });
    });
});
