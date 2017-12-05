const expect = require('chai').expect;
const SqSTestUtils = require('./sqs-test-utils');
const TestUtils = require('./test-utils');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

describe.only('stateMachine', function () {
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
        TestUtils.setGlobalUser();
        TestUtils.setEnvironmentVariables();
        configureLambdas();
        SqSTestUtils.purgeAllQueues().then(() => {
            done();
        });
    });

    describe.only('Flush', function () {

        it.only('should execute all lambdas', function () {

            flushStateMachine()
                .then(results => {
                    expect(results.length).to.equal(lambdas.length);
                });
        });

    });

    function flushStateMachine() {
        return Promise.all(lambdas.map(lambda => lambda(null, null, () => {})))
    }

    function configureLambdas() {
        lambda_names.forEach((lambda_name) => {
            let lambda = global.SixCRM.configuration.serverless_config.functions[lambda_name];
            let handler = lambda.handler;
            let path = global.SixCRM.routes.root + '/' + handler;

            if (lambda.environment) {
                for (let key in lambda.environment) {
                    process.env[key] = lambda.environment[key];
                }
            }

            lambdas.push(require(path));
        });
    }

});

