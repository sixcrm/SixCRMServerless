const expect = require('chai').expect;
const SqSTestUtils = require('./sqs-test-utils');
const TestUtils = require('./test-utils');
const ModelGenerator = require('../model-generator');
const mockery = require('mockery');

let randomRebill;

describe('Pick Rebill', function () {

    before(() => {
        mockery.enable({
            useCleanCache: true,
            warnOnReplace: false,
            warnOnUnregistered: false
        });
        TestUtils.setGlobalUser();
        TestUtils.setEnvironmentVariables();
    });

    beforeEach((done) => {
        return Promise.all([
            SqSTestUtils.purgeAllQueues(),
            ModelGenerator.randomEntityWithId('rebill').then(rebill => { randomRebill = rebill; return true; })
        ]).then(() => { return done() });
    });

    afterEach(() => {
        mockery.resetCache();
    });

    after(() => {
        mockery.deregisterAll();
    });


    it('should not move anything to bill queue when bill table is empty', function () {
        mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
            scanRecords: (table, parameters, callback) => {
                callback(null, []);
            }
        });

        return pickrebill().execute().then((response) => {
            expect(response).to.be.true;
            return SqSTestUtils.messageCountInQueue('bill').then((count) => {
                expect(count).to.equal(0);
                return true;
            });
        });
    });

    it('should move eligible messages to bill queue', function () {
        // given
        let rebill = randomRebill;

        mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
            scanRecords: (table, parameters, callback) => {
                callback(null, [rebill]);
            },
            queryRecords: (table, parameters, index, callback) => {
                callback(null, [rebill]);
            },
            saveRecord: (table, item, callback) => {
                callback(null, item);
            }
        });

        // when
        return pickrebill().execute().then((response) => {
            // then
            expect(response).to.be.true;
            expect(rebill.processing).to.be.equal('true');
            return SqSTestUtils.messageCountInQueue('bill').then((count) => {
                expect(count).to.equal(1);
                return true;
            });
        });
    });

    function pickrebill() {
        process.env.bill_queue = 'bill';
        return global.SixCRM.routes.include('controllers', 'workers/pickRebill');
    }
});

