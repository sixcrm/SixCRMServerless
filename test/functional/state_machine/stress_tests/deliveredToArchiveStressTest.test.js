const expect = require('chai').expect;
const mockery = require('mockery');
const uuidV4 = require('uuid/v4');
const SqSTestUtils = require('../../sqs-test-utils');
const StateMachine = require('../state-machine-test-utils.js');
const SQSDeployment = global.SixCRM.routes.include('deployment', 'utilities/sqs-deployment.js');
const permissionutilities = global.SixCRM.routes.include('lib', 'permission-utilities.js');
const DynamoDbDeployment = global.SixCRM.routes.include('deployment', 'utilities/dynamodb-deployment.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const randomutilities = global.SixCRM.routes.include('lib', 'random.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const fileutilities = global.SixCRM.routes.include('lib', 'file-utilities.js');
const rebillController = global.SixCRM.routes.include('entities', 'Rebill.js');

const max_test_cases = randomutilities.randomInt(900, 1100);

describe('deliveredToArchiveStressTest', () => {

    before((done) => {
        process.env.require_local = true;
        process.env.stage = 'local';

        Promise.resolve()
            .then(() => DynamoDbDeployment.initializeControllers())
            .then(() => DynamoDbDeployment.destroyTables())
            .then(() => DynamoDbDeployment.deployTables())
            .then(() => SQSDeployment.deployQueues())
            .then(() => SQSDeployment.purgeQueues())
            .then(() => done());

    });

    it(`${max_test_cases} rebills are archived`, () => {
        return beforeTest()
            .then(() => timestamp.delay(32 * 1000)())
            .then(() => verifySqs('delivered', max_test_cases))
            .then(() => StateMachine.flush())
            .then(() => timestamp.delay(32 * 1000)())
            .then(() => verifySqs('delivered', 0))
    })

    function beforeTest() {
        return Promise.resolve()
            .then(() => SQSDeployment.purgeQueues())
            .then(() => DynamoDbDeployment.destroyTables())
            .then(() => DynamoDbDeployment.deployTables())
            .then(() => seed())
    }

    function seed() {
        permissionutilities.disableACLs();

        let operations = [];

        for (let i = 0; i < max_test_cases; i++) {
            let rebill = getRebill();

            operations.push(rebillController.create(rebill));
            operations.push(SqSTestUtils.sendMessageToQueue('delivered', '{"id":"' + rebill.id +'"}'));
        }

        return Promise.all(operations)
            .then(() => permissionutilities.enableACLs())
            .catch(() => permissionutilities.enableACLs());
    }

    function verifySqs(queue_name, expected) {

        return SqSTestUtils.messageCountInQueue(queue_name)
            .then(count => {
                return expect(count).to.equal(expected, `Expected ${expected} messages in delivered but got ${count}`);
            });

    }

    function getRebill() {

        return {
            "bill_at": "2017-04-06T18:40:41.405Z",
            "id": uuidV4(),
            "state": "delivered",
            "processing": true,
            "account":"d3fa3bf3-7824-49f4-8261-87674482bf1c",
            "parentsession": "668ad918-0d09-4116-a6fe-0e8a9eda36f7",
            "product_schedules": ["12529a17-ac32-4e46-b05b-83862843055d"],
            "amount": 34.99,
            "created_at":"2017-04-06T18:40:41.405Z",
            "updated_at":"2017-04-06T18:41:12.521Z"
        };

    }

});

