const expect = require('chai').expect;
const SqSTestUtils = require('./sqs-test-utils');
const TestUtils = require('./test-utils');
const ModelGenerator = require('../model-generator');

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

        return ModelGenerator.existing('session').then((session) => {

            return fn.execute(session).then((response) => {
                expect(response).to.equal(fn.messages.successnoaction);
            });

        });

    });

    it('should return validation error when a non-existing session is passed', function () {
        let fn = createRebills();

        return ModelGenerator.randomEntity('session').then((session) => {

            return fn.execute(session).catch((error) => {
                expect(error.message).to.be.equal('[500] One or more validation errors occurred.');
            });

        });

    });

    function createRebills() {
        process.env.rebill_queue = 'rebill';
        process.env.search_indexing_queue = 'search_indexing';
        return global.SixCRM.routes.include('controllers', 'workers/createRebills');
    }
});

