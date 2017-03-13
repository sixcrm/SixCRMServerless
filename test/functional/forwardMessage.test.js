const expect = require('chai').expect;
const SqSTestUtils = require('./sqs-test-utils');

describe('Functional test for message workers', function () {
    let forwardingFunction;

    before(() => {
        setGlobalUser();
        setEnvironmentVariables();
        purgeAllQueues().then(() => {
            done();
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

    function purgeAllQueues() {
        return new Promise((resolve) => {
            Promise.all([
                SqSTestUtils.purgeQueue('bill'),
                SqSTestUtils.purgeQueue('recover'),
                SqSTestUtils.purgeQueue('hold'),
                SqSTestUtils.purgeQueue('shipped'),
                SqSTestUtils.purgeQueue('delivered'),
            ]).then(() => {
                resolve();
            });
        });
    }

    function billToHold() {
        process.env.failure_queue_url = 'http://localhost:9324/queue/recover';
        return configureForwardingFunction(
            'http://localhost:9324/queue/bill',
            'http://localhost:9324/queue/hold',
            'processbilling');
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

    function setGlobalUser() {
        global.user = {
            acl: [{
                account: {
                    id: 'd3fa3bf3-7824-49f4-8261-87674482bf1c'
                },
                role: {
                    permissions: {
                        allow: ['*'],
                        deny: []
                    }
                }
            }]
        };
        global.account = user.acl[0].account.id;
    }

    /**
     * Set the variables for local exectution.
     * Technical Debt: this should be read from serverless.yml and/or config/local/site.yml
     */
    function setEnvironmentVariables() {
        process.env.stage = 'local';

        process.env.dynamo_endpoint = 'http://localhost:8001';
        process.env.endpoint = 'http://localhost:8001';
        process.env.dynamo_endpoint = 'http://localhost:8001';
        process.env.transaction_key = 'ashdaiuwdaw9d0u197f02ji9ujoja90juahwi';
        process.env.site_key = 'anwdadawdjaklwdlakd';
        process.env.development_bypass = 'deathstalker';
        process.env.stage = 'local';
        process.env.AWS_PROFILE = 'six';

        process.env.access_keys_table = 'localaccess_keys';
        process.env.sessions_table = 'localsessions';
        process.env.transactions_table = 'localtransactions';
        process.env.rebills_table = 'localrebills';
        process.env.customers_table = 'localcustomers';
        process.env.products_table = 'localproducts';
        process.env.credit_cards_table = 'localcredit_cards';
        process.env.users_table = 'localusers';
        process.env.loadbalancers_table = 'localloadbalancers';
        process.env.product_schedules_table = 'localproduct_schedules';
        process.env.affiliates_table = 'localaffiliates';
        process.env.campaigns_table = 'localcampaigns';
        process.env.merchant_providers_table = 'localmerchant_providers';
        process.env.fulfillment_providers_table = 'localfulfillment_providers';
        process.env.emails_table = 'localemails';
        process.env.smtp_providers_table = 'localsmtp_providers';
        process.env.shipping_receipts_table = 'localshipping_receipts';

        process.env.bill_queue_url = 'http://localhost:9324/queue/bill';
        process.env.recover_queue_url = 'http://localhost:9324/queue/recover';
        process.env.hold_queue_url = 'http://localhost:9324/queue/hold';
        process.env.pending_queue_url = 'http://localhost:9324/queue/pending';
        process.env.pending_failed_queue_url = 'http://localhost:9324/queue/pending-failed';
        process.env.shipped_queue_url = 'http://localhost:9324/queue/shipped';
        process.env.delivered_queue_url = 'http://localhost:9324/queue/delivered';
        process.env.rebill_queue_url = 'http://localhost:9324/queue/rebill';
        process.env.rebill_failed_queue_url = 'http://localhost:9324/queue/rebill-failure';
    }
});

