const expect = require('chai').expect;
const uuidV4 = require('uuid/v4');
const SqSTestUtils = require('../../sqs-test-utils');
const StateMachine = require('../state-machine-test-utils.js');
const SQSDeployment = global.SixCRM.routes.include('deployment', 'utilities/sqs-deployment.js');
const permissionutilities = global.SixCRM.routes.include('lib', 'permission-utilities.js');
const DynamoDbDeployment = global.SixCRM.routes.include('deployment', 'utilities/dynamodb-deployment.js');
const randomutilities = global.SixCRM.routes.include('lib', 'random.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const timer = global.SixCRM.routes.include('lib', 'timer.js');
const rebillController = global.SixCRM.routes.include('entities', 'Rebill.js');
const numberUtilities = global.SixCRM.routes.include('lib', 'number-utilities.js');
const tab = '      ';

const max_test_cases = randomutilities.randomInt(100, 200);

describe('pickRebillsToBillStressTest', () => {

    before((done) => {
        process.env.require_local = true;

        Promise.resolve()
            .then(() => DynamoDbDeployment.initializeControllers())
            .then(() => DynamoDbDeployment.destroyTables())
            .then(() => DynamoDbDeployment.deployTables())
            .then(() => SQSDeployment.deployQueues())
            .then(() => SQSDeployment.purgeQueues())
            .then(() => done());

    });

    it(`${max_test_cases} rebills are picked from dynamo`, () => {
        return beforeTest()
            .then(() => waitForNumberOfMessages('bill', 0))
            .then(() => console.log(tab + 'Waiting for flush to finish'))
            .then(() => timer.set())
            .then(() => StateMachine.flush())
            .then(() => waitForNumberOfMessages('bill', max_test_cases - number_of_ignored))
            .then(() => {
                let total = timer.get();

                console.log(tab + 'Total processing time: ' + total + ' ms');
                console.log(tab + numberUtilities.formatFloat(total/max_test_cases, 2) + 'ms per message');
            });
    });

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

            operations.push(rebillController.create({entity: rebill}));
        }

        return Promise.all(operations)
            .then(() => permissionutilities.enableACLs())
            .catch(() => permissionutilities.enableACLs());
    }

    function waitForNumberOfMessages(queue_name, number, retries) {

        if (retries === undefined) {
            retries = 0;
        }

        if (retries > 3) {
            return Promise.reject('Too many retries');
        }

        return SqSTestUtils.messageCountInQueue(queue_name)
            .then((count) => {
                console.log(tab + 'Waiting for ' + number + ' messages to be in ' + queue_name + '. Got ' + count);
                if ((number === 0 && count > 0) || (number > 0 && count < number)) {
                    return timestamp.delay(1 * 1000)().then(() => waitForNumberOfMessages(queue_name, number, ++retries))
                } else if (number > 0 && count > number) {
                    console.log('Too many messages in queue ' + queue_name);
                    return Promise.reject('Too many messages in queue ' + queue_name);
                } else {
                    return Promise.resolve();
                }
            });
    }

    function getRebill() {

        return {
            "bill_at": "2017-04-06T18:40:41.405Z",
            "id": uuidV4(),
            "account":"d3fa3bf3-7824-49f4-8261-87674482bf1c",
            "parentsession": "668ad918-0d09-4116-a6fe-0e8a9eda36f7",
            "product_schedules": ["12529a17-ac32-4e46-b05b-83862843055d"],
            "amount": 34.99,
            "created_at":"2017-04-06T18:40:41.405Z",
            "updated_at":"2017-04-06T18:41:12.521Z"
        };

    }

});

