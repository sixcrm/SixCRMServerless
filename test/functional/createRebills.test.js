const expect = require('chai').expect;
const SqSTestUtils = require('./sqs-test-utils');
const TestUtils = require('./test-utils');

describe('createRebills', function () {
    before((done) => {
        TestUtils.setGlobalUser();
        TestUtils.setEnvironmentVariables();
        SqSTestUtils.purgeAllQueues().then(() => {
            done();
        });
    });

    it('should move message from bill to rebill', function () {
        let fn = createRebills();
        let session = givenAnySession();
        return fn.execute(session).then((response) => {
            expect(response).to.equal(fn.messages.success);
        });
    });


    function givenAnySession() {
        return {
            "id": "668ad918-0d09-4116-a6fe-0e8a9eda36f7"
        }
    }

    function createRebills() {
        process.env.rebill_queue_url = 'http://localhost:9324/queue/rebill';
        return require('../../controllers/workers/createRebills');
    }
});

