const expect = require('chai').expect;
const mockery = require('mockery');
const SqSTestUtils = require('./sqs-test-utils');
const TestUtils = require('./test-utils');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const lambdautilities = global.SixCRM.routes.include('lib', 'lambda-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');


describe.only('stateMachine', () => {
    let lambdas = [];
    let lambda_names = [
        'billtohold',
        'recovertohold',
        'holdtopending',
        'pendingfailedtopending',
        'pendingtoshipped',
        'shippedtodelivered',
        'deliveredtoarchive',
        'holdtoarchive',
        'rebilltoarchive',
        'recovertoarchive',
        'pickrebillstobill'
    ];

    before((done) => {
        process.env.require_local = true;
        process.env.stage = 'local';

        mockery.enable({
            useCleanCache: true,
            warnOnReplace: false,
            warnOnUnregistered: false
        });

        TestUtils.setGlobalUser();
        TestUtils.setEnvironmentVariables();
        configureLambdas();
        SqSTestUtils.purgeAllQueues().then(() => done());
    });

    beforeEach((done) => {
        let RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');

        RebillHelperController.prototype.updateRebillState = () => {
            return Promise.resolve();
        };
        RebillHelperController.prototype.getAvailableRebillsAsMessages = () => {
            return Promise.resolve([]);
        };

        SqSTestUtils.purgeAllQueues().then(() => done());
    });

    afterEach(() => {
        delete require.cache[require.resolve(global.SixCRM.routes.path('helpers', 'entities/rebill/Rebill.js'))];
    });


    after((done) => {
        SqSTestUtils.purgeAllQueues().then(() => done());
    });

    describe('Flush', () => {

        it('should execute all lambdas', () => {

            flushStateMachine()
                .then(results => {
                    expect(results.length).to.equal(lambdas.length);
                });
        });

    });

    describe.only('Moving messages', () => {

        let tests = [
            {from: 'bill', to: 'hold', worker: 'processBilling.js', status: 'success', messages: 1},
            {from: 'bill', to: 'hold', worker: 'processBilling.js', status: 'success', messages: 9},
            {from: 'bill', to: 'hold', worker: 'processBilling.js', status: 'success', messages: 10},
            {from: 'bill', to: 'hold', worker: 'processBilling.js', status: 'success', messages: 11},
            {from: 'bill', to: 'hold', worker: 'processBilling.js', status: 'success', messages: 21},
            {from: 'bill', to: 'recover', worker: 'processBilling.js', status: 'fail', messages: 1},
            {from: 'bill', to: 'bill', worker: 'processBilling.js', status: 'noaction', messages: 1},
            {from: 'bill', to: 'bill_error', worker: 'processBilling.js', status: 'error', messages: 1},
            {from: 'hold', to: 'pending', worker: 'shipProduct.js', status: 'success', messages: 1},
            {from: 'hold', to: 'pending_failed', worker: 'shipProduct.js', status: 'fail', messages: 1},
            {from: 'hold', to: 'hold', worker: 'shipProduct.js', status: 'noaction', messages: 5},
            {from: 'pending', to: 'shipped', worker: 'confirmShipped.js', status: 'success', messages: 1},
            {from: 'pending_failed', to: 'pending', worker: 'shipProduct.js', status: 'success', messages: 1},
            {from: 'recover', to: 'hold', worker: 'recoverBilling.js', status: 'success', messages: 1},
            {from: 'shipped', to: 'delivered', worker: 'confirmDelivered.js', status: 'success', messages: 1}
        ];

        arrayutilities.map(tests, (test) => {
            it(`should move ${test.messages} message(es) from ${test.from} to ${test.to}`, () => {

                mockery.registerMock(global.SixCRM.routes.path('controllers', `workers/${test.worker}`), {
                    execute: () => {
                        const WorkerResponse = class {
                            getCode() {
                                return test.status;
                            }

                            getAdditionalInformation() {
                                return test.status;
                            }
                        };

                        return Promise.resolve(new WorkerResponse());
                    }
                });

                let rebill = JSON.stringify(getValidRebill());

                let expected_number_in_input = 0;
                let expected_number_in_output = test.messages;
                let error_message = 'Message(es) not delivered to destination queue.';

                if (test.status === 'noaction') {
                    expected_number_in_input = expected_number_in_output;
                    error_message = 'Message moved out of input queue.'
                }

                let messages = [];

                for (let i = 0; i < test.messages; i++) {
                    messages.push(SqSTestUtils.sendMessageToQueue(test.from, rebill))
                }

                return Promise.all(messages)
                    .then(() => SqSTestUtils.messageCountInQueue(test.from))
                    .then((count) => expect(count).to.equal(test.messages, 'Message(es) not delivered to input queue.'))
                    .then(() => flushStateMachine())
                    .then(() => Promise.all([
                        SqSTestUtils.messageCountInQueue(test.from),
                        SqSTestUtils.messageCountInQueue(test.to)]))
                    .then((counts) => expect(counts).to.deep.equal(
                        [expected_number_in_input, expected_number_in_output], error_message))
                    // .then(() => timestamp.delay(31*1000)())
                    // .then(() => SqSTestUtils.receiveMessageFromQueue(test.to))
                    // .then((message) => {
                    //     expect(message.id).to.equal(rebill.id);
                    //     expect(message.account).to.equal(rebill.account);
                    //     expect(message.amount).to.equal(rebill.amount);
                    //     expect(message.parrentsession).to.equal(rebill.parrentsession);
                    //     expect(message.product_schedules).to.deep.equal(rebill.product_schedules);
                    //     expect(message.bill_at).to.equal(rebill.bill_at);
                    //     expect(message.created_at).to.equal(rebill.created_at);
                    //     expect(message.updated_at).to.equal(rebill.updated_at);
                    // })

            });
        });


    });

    describe('Archiving messages', () => {

        let tests = [
            {from: 'hold'},
            {from: 'delivered'},
            {from: 'rebill'},
            {from: 'recover'}
        ];

        arrayutilities.map(tests, (test) => {
            it(`should archive a message from ${test.from}`, () => {

                mockery.registerMock(global.SixCRM.routes.path('controllers', `workers/archive.js`), {
                    execute: () => {
                        const WorkerResponse = class {
                            getCode() {
                                return 'success';
                            }

                            getAdditionalInformation() {
                                return 'success';
                            }
                        };

                        return Promise.resolve(new WorkerResponse());
                    }
                });

                let rebill = JSON.stringify(getValidRebill());

                return SqSTestUtils.messageCountInQueue(test.from)
                    .then((count) => expect(count).to.equal(0, 'Queue is not empty at the start of test.'))
                    .then(() => SqSTestUtils.sendMessageToQueue(test.from, rebill))
                    .then(() => SqSTestUtils.messageCountInQueue(test.from))
                    .then((count) => expect(count).to.equal(1, 'Message was not delivered to input queue.'))
                    .then(() => flushStateMachine())
                    .then(() => SqSTestUtils.messageCountInQueue(test.from))
                    .then((count) => expect(count).to.equal(0, 'Message was left in input queue.'))
            });
        });
    });

    function flushStateMachine() {
        let all_function_executions = arrayutilities.map(lambdas, (lambda) => {
            let function_name = Object.keys(lambda); // function is the first property of the handler

            return lambda[function_name](null, null, () => {})
        });

        return Promise.all(all_function_executions).then((results) => {
            return timestamp.delay(0.05*1000)().then(() => results);
        });
    }

    function configureLambdas() {
        arrayutilities.map(lambda_names, (lambda_name) => {
            lambdas.push(lambdautilities.getLambdaInstance(lambda_name));
        });
    }

    function getValidRebill(){

        return {
            "bill_at": "2017-04-06T18:40:41.405Z",
            "id": "70de203e-f2fd-45d3-918b-460570338c9b",
            "account":"d3fa3bf3-7824-49f4-8261-87674482bf1c",
            "parentsession": "1fc8a2ef-0db7-4c12-8ee9-fcb7bc6b075d",
            "product_schedules": ["2200669e-5e49-4335-9995-9c02f041d91b"],
            "amount": 79.99,
            "created_at":"2017-04-06T18:40:41.405Z",
            "updated_at":"2017-04-06T18:41:12.521Z"
        };

    }

});

