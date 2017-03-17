const expect = require('chai').expect;
const SqSTestUtils = require('./sqs-test-utils');
const TestUtils = require('./test-utils');

describe('Functional test for message workers', function () {
    let forwardingFunction;

    before((done) => {
        TestUtils.setGlobalUser();
        TestUtils.setEnvironmentVariables();
        SqSTestUtils.purgeAllQueues().then(() => {
            done();
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
                });
            });
        });

        it('should say "success" when there is a message, and delete it', function () {
            return givenAnyMessageInRebillQueue().then(() => {
                return forwardingFunction.execute().then((response) => {
                    expect(response).to.equal(forwardingFunction.messages.success);
                    return SqSTestUtils.messageCountInQueue('rebill').then(count => {
                        expect(count).to.equal(0);
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
            });
        });


        // Technical Debt: don't skip this test. Fix the 'cannot read property' in USPS.js
        xit('should say "no action" when there is a message', function (done) {
            givenAnyMessageInShippedQueue().then(() => {
                forwardingFunction.execute().then((response) => {
                    expect(response).to.equal(forwardingFunction.messages.success);
                    done();
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
            });
        });

        it('should say "success" when there is a message, and delete it', function () {
            return givenAnyMessageInDeliveredQueue().then(() => {
                return forwardingFunction.execute().then((response) => {
                    expect(response).to.equal(forwardingFunction.messages.success);
                    return SqSTestUtils.messageCountInQueue('delivered').then(count => {
                        expect(count).to.equal(0);
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
        process.env.failure_queue_url = 'http://localhost:9324/queue/recover';
        return configureForwardingFunction(
            'http://localhost:9324/queue/bill',
            'http://localhost:9324/queue/hold',
            'processbilling');
    }

    function rebillToArchive() {
        let func =  configureForwardingFunction(
            'http://localhost:9324/queue/rebill',
            null,
            'createrebills');
        delete process.env.destination_queue_url;
        return func;
    }

    function shippedToDelivered() {
        return configureForwardingFunction(
            'http://localhost:9324/queue/shipped',
            'http://localhost:9324/queue/delivered',
            'confirmdelivered');
    }

    function deliveredToArchive() {
        process.env.archivefilter = 'ALL';
        let func =  configureForwardingFunction(
            'http://localhost:9324/queue/delivered',
            null,
            'archive');
        delete process.env.destination_queue_url;
        return func;
    }

    function configureForwardingFunction(originQueue, destinationQueue, workerFunction) {
        process.env.origin_queue_url = originQueue;
        process.env.destination_queue_url = destinationQueue;
        process.env.workerfunction = workerFunction;

        return require('../../controllers/workers/forwardMessage');
    }
});

