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
const shippingReceiptController = global.SixCRM.routes.include('entities', 'ShippingReceipt.js');
const fulfillmentProviderController = global.SixCRM.routes.include('entities', 'FulfillmentProvider.js');
const transactionController = global.SixCRM.routes.include('entities', 'Transaction.js');
const MockEntities = global.SixCRM.routes.include('test','mock-entities.js');
const numberUtilities = global.SixCRM.routes.include('lib', 'number-utilities.js');
const tab = '      ';

const max_test_cases = randomutilities.randomInt(5, 9);

describe('pendingToShippedStressTest', () => {

    let number_of_incorrect = 0;
    let lambda_filter = ["pendingtoshipped"];

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

    it(`${max_test_cases} rebills are sent to shipped`, () => {
        return beforeTest()
            .then(() => waitForNumberOfMessages('pending', max_test_cases))
            .then(() => console.log(tab + 'Waiting for flush to finish'))
            .then(() => timer.set())
            .then(() => StateMachine.flush(lambda_filter))
            .then(() => waitForNumberOfMessages('pending', 0))
            .then(() => waitForNumberOfMessages('pending_error', number_of_incorrect))
            .then(() => waitForNumberOfMessages('shipped', max_test_cases - number_of_incorrect))
            .then(() => {
                let total = timer.get();

                console.log(tab + 'Total processing time: ' + total + 'ms');
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

    function seed() {
        permissionutilities.disableACLs();

        let operations = [];
        let fulfillment_provider = getValidFulfillmentProvider();

        for (let i = 0; i < max_test_cases; i++) {
            let rebill = getRebill();
            let transaction = MockEntities.getValidTransaction();
            let shipping_receipt = MockEntities.getValidShippingReceipt();
            let rebill_id = [rebill.id/*, "-garbage-"*/];

            //prepare data
            rebill.id = randomutilities.selectRandomFromArray(rebill_id);
            transaction.rebill = rebill.id;
            transaction.merchant_provider = "a32a3f71-1234-4d9e-a9a1-98ecedb88f24";
            transaction.products = [transaction.products[0]];
            transaction.products[0].shipping_receipt = shipping_receipt.id;

            //rebills with "-garbage-" id go to error
            if (rebill.id === "-garbage-") number_of_incorrect++;

            operations.push(rebillController.create({entity: rebill}));
            operations.push(transactionController.create({entity: transaction}));
            operations.push(shippingReceiptController.create({entity: shipping_receipt}));
            operations.push(SqSTestUtils.sendMessageToQueue('pending', '{"id":"' + rebill.id +'"}'));
        }

        operations.push(fulfillmentProviderController.create({entity: fulfillment_provider}));

        return Promise.all(operations)
            .then(() => permissionutilities.enableACLs())
            .catch(() => permissionutilities.enableACLs());
    }

    function getRebill() {
        return {
            "bill_at": "2017-04-06T18:40:41.405Z",
            "id": uuidV4(),
            "state": "pending",
            "processing": true,
            "account":"d3fa3bf3-7824-49f4-8261-87674482bf1c",
            "parentsession": "668ad918-0d09-4116-a6fe-0e8a9eda36f7",
            "product_schedules": ["12529a17-ac32-4e46-b05b-83862843055d"],
            "amount": 34.99,
            "created_at":"2017-04-06T18:40:41.405Z",
            "updated_at":"2017-04-06T18:41:12.521Z"
        };
    }

    function getValidFulfillmentProvider() {
        return {
            "id":"5d18d0fa-5812-4c37-b98c-7b1debdcb435",
            "account":"eefdeca6-41bc-4af9-a561-159acb449b5e",
            "name":"Integration Test Fulfillment Provider",
            "provider":{
                "name":"Test"
            },
            "created_at":"2017-04-06T18:40:41.405Z",
            "updated_at":"2017-04-06T18:41:12.521Z"
        }
    }

});

