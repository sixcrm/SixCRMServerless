const expect = require('chai').expect;
const SqSTestUtils = require('./sqs-test-utils');
const TestUtils = require('./test-utils');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

describe('Functional test for message workers', function () {
    let forwardingFunction;

    before((done) => {
        process.env.require_local = true;
        TestUtils.setGlobalUser();
        TestUtils.setEnvironmentVariables();
        return SqSTestUtils.purgeAllQueues().then(() => {
            return done();
        });
    });

    describe('Confirms messages can move from rebill queue.', function () {
        before(() => {
            forwardingFunction = rebillToArchive();
        });

        it('should say "no message" when no message is in input queue', function () {
            return forwardingFunction.execute().then((response) => {
                expect(response).to.equal(forwardingFunction.messages.successnomessages);
                return SqSTestUtils.messageCountInQueue('rebill').then((count) => {
                    expect(count).to.equal(0);
                    return true;
                });
            });
        });

        it('should say "success" when there is a message, and delete it', function () {
            this.timeout(1000);
            return givenAnyMessageInRebillQueue().then(() => {
                return forwardingFunction.execute().then((response) => {
                    expect(response).to.equal(forwardingFunction.messages.success);
                    return SqSTestUtils.messageCountInQueue('rebill').then(count => {
                        expect(count).to.equal(0);
                        return true;
                    });
                });
            });
        });

    });

    describe('Confirms messages can move from bill to hold.', function () {
        before(() => {
            forwardingFunction = billToHold();
        });

        it('should say "no message" when no message is in input queue', function () {
            return forwardingFunction.execute().then((response) => {
                expect(response).to.equal(forwardingFunction.messages.successnomessages);
                return SqSTestUtils.messageCountInQueue('hold').then((count) => {
                    expect(count).to.equal(0);
                    return true;
                });
            });
        });
    });

    describe('Confirms messages can move from bill to recover.', function () {
        before(() => {
            forwardingFunction = billToHold();
        });

        // Technical Debt: finish this.
        xit('should move the message to recover when failure occurs', function () {
            return givenAnyMessageInBillQueueThatShouldFailToForward().then(() => {
                return forwardingFunction.execute().then((response) => {
                    expect(response).to.equal(forwardingFunction.messages.failforward);
                    return SqSTestUtils.messageCountInQueue('recover').then((count) => {
                        expect(count).to.equal(1);
                        return SqSTestUtils.messageCountInQueue('hold').then((count) => {
                            expect(count).to.equal(0);
                            return true;
                        });
                    });
                });
            });
        });
    });

    describe('Confirms messages can move from shipped to delivered.', function () {
        before(() => {
            forwardingFunction = shippedToDelivered();
        });

        it('should say "no message" when no message is in input queue', function () {
            return forwardingFunction.execute().then((response) => {
                expect(response).to.equal(forwardingFunction.messages.successnomessages);
                return true;
            });
        });


        // Technical Debt: don't skip this test. Fix the 'cannot read property' in USPS.js
        xit('should say "no action" when there is a message', function (done) {
            return givenAnyMessageInShippedQueue().then(() => {
                return forwardingFunction.execute().then((response) => {
                    expect(response).to.equal(forwardingFunction.messages.success);
                    return done();
                }).catch(error => {
                    done(error);
                });
            });
        });
    });

    describe('Confirms messages can move from delivered to archive.', function () {
        before(() => {
            forwardingFunction = deliveredToArchive();
        });

        it('should say "no message" when no message is in input queue', function () {
            return forwardingFunction.execute().then((response) => {
                expect(response).to.equal(forwardingFunction.messages.successnomessages);
                return true;
            });
        });

        it('should say "success" when there is a message, and delete it', function () {
            this.timeout(1000);
            return givenAnyMessageInDeliveredQueue().then(() => {
                return forwardingFunction.execute().then((response) => {
                    expect(response).to.equal(forwardingFunction.messages.success);
                    return SqSTestUtils.messageCountInQueue('delivered').then(count => {
                        expect(count).to.equal(0);
                        return true;
                    });
                });
            });
        });
    });

    function givenAnyMessageInShippedQueue() {
        return SqSTestUtils.sendMessageToQueue('shipped', '{"id":"55c103b4-670a-439e-98d4-5a2834bb5fc3"}');
    }

    function givenAnyMessageInBillQueueThatShouldFailToForward() {
        return SqSTestUtils.sendMessageToQueue('bill', '{"id":"55c103b4-670a-439e-98d4-5a2834bb5fc3"}');
    }

    function givenAnyMessageInDeliveredQueue() {
        return SqSTestUtils.sendMessageToQueue('delivered', '{"id":"55c103b4-670a-439e-98d4-5a2834bb5fc3"}');
    }

    function givenAnyMessageInRebillQueue() {
        return SqSTestUtils.sendMessageToQueue('rebill', '{"id":"' + givenAnySession().id + '"}');
    }

    function givenAnySession() {
        return {
            "id": "668ad918-0d09-4116-a6fe-0e8a9eda36f7"
        }
    }

    function billToHold() {
        process.env.failure_queue = 'recover';
        return configureForwardingFunction(
            'bill',
            'hold',
            'processbilling');
    }

    function rebillToArchive() {
        let func =  configureForwardingFunction(
            'rebill',
            null,
            'createrebills');

        delete process.env.destination_queue;
        return func;
    }

    function shippedToDelivered() {
        return configureForwardingFunction(
            'shipped',
            'delivered',
            'confirmdelivered');
    }

    function deliveredToArchive() {
        process.env.archivefilter = 'ALL';
        let func =  configureForwardingFunction(
            'delivered',
            null,
            'archive');

        delete process.env.destination_queue;
        return func;
    }

    function configureForwardingFunction(originQueue, destinationQueue, workerFunction) {

        du.debug('Configure Forwarding Function', originQueue, destinationQueue, workerFunction);

        process.env.origin_queue = originQueue;
        process.env.destination_queue = destinationQueue;
        process.env.workerfunction = workerFunction;

        return require('../../controllers/workers/forwardMessage');
    }
});

