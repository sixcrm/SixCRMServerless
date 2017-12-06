const expect = require('chai').expect;
const mockery = require('mockery');
const SqSTestUtils = require('./sqs-test-utils');
const TestUtils = require('./test-utils');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

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
        // 'pickrebillstobill'
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
        SqSTestUtils.purgeAllQueues().then(() => {
            done();
        });
    });

    describe('Flush', () => {

        it('should execute all lambdas', () => {

            flushStateMachine()
                .then(results => {
                    expect(results.length).to.equal(lambdas.length);
                });
        });

    });

    describe('Moving messages', () => {

        it('should move a message from bill to hold', () => {

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'workers/processBilling.js'), {
                execute: () => {
                    const WorkerResponse = class {
                        getCode() {
                            return 'success';
                        }
                    };

                    return Promise.resolve(new WorkerResponse());
                }
            });

            let RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
            RebillHelperController.prototype.updateRebillState = () => {
                return Promise.resolve();
            };

            return Promise.all([
                SqSTestUtils.messageCountInQueue('bill'),
                SqSTestUtils.messageCountInQueue('hold')])
            .then((counts) => {
                return expect(counts).to.deep.equal([0,0])})
            .then(() => {
                return SqSTestUtils.sendMessageToQueue('bill', JSON.stringify(getValidRebill()))})
            .then(() => {
                return SqSTestUtils.messageCountInQueue('bill')})
            .then((count) => {
                return expect(count).to.equal(1)})
            .then(() => {
                return flushStateMachine()})
            .then(() => {
                return Promise.all([
                    SqSTestUtils.messageCountInQueue('bill'),
                    SqSTestUtils.messageCountInQueue('hold')])})
            .then((counts) => {
                return expect(counts).to.deep.equal([0, 1])})

        });

    });


    function flushStateMachine() {
        let all_function_executions = arrayutilities.map(lambdas, (lambda) => {
            let function_name = Object.keys(lambda); // function is the first property of the handler

            return lambda[function_name](null, null, () => {})
        });

        return Promise.all(all_function_executions);
    }

    function configureLambdas() {
        lambda_names.forEach((lambda_name) => {
            let lambda = global.SixCRM.configuration.serverless_config.functions[lambda_name];
            let handler = lambda.handler.replace(/\.[^/.]+$/, '') ; // strip function name from path, i.e. 'handler.billtohold'

            let path = global.SixCRM.routes.root + '/' + handler;

            if (lambda.environment) {
                for (let key in lambda.environment) {
                    process.env[key] = lambda.environment[key];
                }
            }

            lambdas.push(require(path));
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

