const expect = require('chai').expect;
const mockery = require('mockery');
const uuidV4 = require('uuid/v4');
const SqSTestUtils = require('./sqs-test-utils');
const TestUtils = require('./test-utils');
const SQSDeployment = global.SixCRM.routes.include('deployment', 'utilities/sqs-deployment.js');
const sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');
const randomutilities = global.SixCRM.routes.include('lib', 'random.js');
const DynamoDbDeployment = global.SixCRM.routes.include('deployment', 'utilities/dynamodb-deployment.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const lambdautilities = global.SixCRM.routes.include('lib', 'lambda-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');
const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');

describe.only('stateMachineDocker', () => {
    let lambdas = [];
    let lambda_names = [
        'pickrebillstobill',
        'billtohold',
        'recovertohold',
        'holdtopending',
        'pendingtoshipped',
        'shippedtodelivered',
        'deliveredtoarchive',
        'holdtoarchive',
        'rebilltoarchive',
        'recovertoarchive'
    ];

    before((done) => {
        process.env.require_local = true;
        process.env.stage = 'local';

        mockery.enable({
            useCleanCache: true,
            warnOnReplace: false,
            warnOnUnregistered: false
        });

        configureLambdas();

        DynamoDbDeployment.deployTables()
            .then(() => SQSDeployment.deployQueues())
            .then(() => SqSTestUtils.purgeAllQueues())
            .then(() => DynamoDbDeployment.seedTables())
            .then(() => done());

    });

    beforeEach(() => {
    });

    afterEach(() => {
        delete require.cache[require.resolve(global.SixCRM.routes.path('helpers', 'entities/rebill/Rebill.js'))];
    });


    after((done) => {
        SqSTestUtils.purgeAllQueues().then(() => done());
    });

    describe('Database is ready', () => {

        it('should write rebill to database', () => {
            let rebillController = global.SixCRM.routes.include('entities', 'Rebill.js');
            let rebill = MockEntities.getValidRebill();

            return rebillController.create({entity: rebill})
                .then(() => rebillController.get({id: rebill.id}))
                .then((result) => {
                    expect(result.id).to.deep.equal(rebill.id);
                    expect(result.amount).to.deep.equal(rebill.amount)})

        });

        it('should have seed data', () => {
            let userController = global.SixCRM.routes.include('entities', 'User.js');

            return userController.get({id: 'system@sixcrm.com'})
                .then(user => {
                    expect(user.id).to.equal('system@sixcrm.com')
                });

        });

    });

    describe('SQS is ready', () => {

        after((done) => {
            SqSTestUtils.purgeAllQueues().then(() => done());
        });

        it('should put a message in queue', () => {
            let body = '{"id":"55c103b4-670a-439e-98d4-5a2834bb5fc3"}';
            return SqSTestUtils.sendMessageToQueue('bill', body)
                .then(() => sqsutilities.receiveMessages({queue: 'bill'}))
                .then((messages) => expect(messages[0].Body).to.deep.equal(body))

        });

    });

    describe('Pick Rebill To Bill', () => {

        let rebillController = global.SixCRM.routes.include('entities', 'Rebill.js');
        let rebill = {
            bill_at: timestamp.getISO8601(),
            id: uuidV4(),
            account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
            parentsession: '1fc8a2ef-0db7-4c12-8ee9-fcb7bc6b075d',
            product_schedules: ["2200669e-5e49-4335-9995-9c02f041d91b"],
            amount: randomutilities.randomDouble(1, 200, 2),
            created_at:timestamp.getISO8601(),
            updated_at:timestamp.getISO8601()
        };

        before((done) => {
            Promise.all([
                rebillController.create({entity: rebill}),
            ]).then(() => done());
        });

        it('rebill should be picked from dynamo and moved to bill', () => {

            return rebillController.get({id: rebill.id})
                .then(rebill => expect(rebill.state).to.equal(undefined))
                .then(() => flushStateMachine())
                .then(() => rebillController.get({id: rebill.id}))
                .then(rebill => expect(rebill.state).to.equal('bill'))
        });

    });

    xdescribe('Bill To Hold', () => {

        let rebillController = global.SixCRM.routes.include('entities', 'Rebill.js');
        let rebill = {
            bill_at: timestamp.getISO8601(),
            id: uuidV4(),
            state: 'bill',
            account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
            parentsession: '1fc8a2ef-0db7-4c12-8ee9-fcb7bc6b075d',
            product_schedules: ["2200669e-5e49-4335-9995-9c02f041d91b"],
            amount: randomutilities.randomDouble(1, 200, 2),
            created_at:timestamp.getISO8601(),
            updated_at:timestamp.getISO8601()
        };

        before((done) => {
            Promise.all([
                rebillController.create({entity: rebill}),
                SqSTestUtils.sendMessageToQueue('bill', '{"id":"' + rebill.id +'"}')
            ]).then(() => done());
        });

        it('rebill should moved from bill to hold and updated', () => {

            return rebillController.get({id: rebill.id})
                .then(rebill => expect(rebill.state).to.equal('bill'))
                .then(() => flushStateMachine())
                .then(() => rebillController.get({id: rebill.id}))
                .then(rebill => expect(rebill.state).to.equal('hold'))
        });

    });

    function flushStateMachine() {

        let all_function_executions = arrayutilities.map(lambdas, (lambda) => {
            let function_name = Object.keys(lambda); // function is the first property of the handler

            return lambda[function_name](null, null, () => {
            })
        });

        return Promise.all(all_function_executions).then((results) => {
            return timestamp.delay(0.3 * 1000)().then(() => results);
        });
    }

    function configureLambdas() {
        arrayutilities.map(lambda_names, (lambda_name) => {
            lambdas.push(lambdautilities.getLambdaInstance(lambda_name));
        });
    }

});

