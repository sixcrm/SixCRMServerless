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

    it('should return success when a valid session is passed', function () {
        let fn = createRebills();
        let session = givenAnySession();
        return fn.execute(session).then((response) => {
            expect(response).to.equal(fn.messages.success);
        });
    });

    it('should return validation error when a non-existing session is passed', function () {
        let fn = createRebills();
        let session = givenNonExistingSession();
        return fn.execute(session).catch((error) => {
            expect(error.message).to.be.equal('One or more validation errors occurred.');
        });
    });


    function givenAnySession() {
        return {
            "id": "668ad918-0d09-4116-a6fe-0e8a9eda36f7"
        }
    }

    function givenNonExistingSession() {
        return {
            "id": "668ad918-0d09-4242-a6fe-0e8a9eda36f7"
        }
    }

    function createRebills() {
        process.env.rebill_queue_url = 'http://localhost:9324/queue/rebill';
        process.env.search_indexing_queue_url = 'http://localhost:9324/queue/searchindex';
        return require('../../controllers/workers/createRebills');
    }
});

