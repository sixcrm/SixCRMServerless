require('../state-machine-test-setup');
const uuidV4 = require('uuid/v4');
const SqSTestUtils = require('../../sqs-test-utils');
const StateMachine = require('../state-machine-test-utils.js');
const SQSDeployment = global.SixCRM.routes.include('deployment', 'utilities/sqs-deployment.js');
const permissionutilities = global.SixCRM.routes.include('lib', 'permission-utilities.js');
const DynamoDbDeployment = global.SixCRM.routes.include('deployment', 'utilities/dynamodb-deployment.js');
const randomutilities = global.SixCRM.routes.include('lib', 'random.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const timer = global.SixCRM.routes.include('lib', 'timer.js');
const rebillController = global.SixCRM.routes.include('entities', 'Rebill.js');
const numberUtilities = global.SixCRM.routes.include('lib', 'number-utilities.js');
const MockEntities = global.SixCRM.routes.include('test','mock-entities.js');
const tab = '      ';

const max_test_cases = randomutilities.randomInt(100, 200);

describe('deliveredToArchiveStressTest', () => {

    let number_of_incorrect = 0;

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

    it(`${max_test_cases} rebills are archived`, () => {
        return beforeTest()
            .then(() => waitForNumberOfMessages('delivered', max_test_cases))
            .then(() => du.output(tab + 'Waiting for flush to finish'))
            .then(() => timer.set())
            .then(() => StateMachine.flush())
            .then(() => waitForNumberOfMessages('delivered', 0))
            .then(() => waitForNumberOfMessages('delivered_error', number_of_incorrect))
            .then(() => {
                let total = timer.get();

                du.output(tab + 'Total processing time: ' + total + 'ms');
                du.output(tab + numberUtilities.formatFloat(total/max_test_cases, 2) + 'ms per message');
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
                du.output(tab + 'Waiting for ' + number + ' messages to be in ' + queue_name + '. Got ' + count);
                if ((number === 0 && count > 0) || (number > 0 && count < number)) {
                    return timestamp.delay(1 * 1000)().then(() => waitForNumberOfMessages(queue_name, number, ++retries))
                } else if (number > 0 && count > number) {
                    du.output('Too many messages in queue ' + queue_name);
                    return Promise.reject('Too many messages in queue ' + queue_name);
                } else {
                    return Promise.resolve();
                }
            });
    }

    function seed() {
        permissionutilities.disableACLs();

        let operations = [];

        for (let i = 0; i < max_test_cases; i++) {
            let rebill = MockEntities.getValidRebill();
            let rebill_id = [rebill.id, uuidV4()];

            //create random scenario
            rebill_id = randomutilities.selectRandomFromArray(rebill_id);

            //prepare data
            rebill.state = "delivered";
            rebill.processing = true;

            //missing rebill goes to error
            if (rebill.id !== rebill_id)
                number_of_incorrect++;

            operations.push(rebillController.create({entity: rebill}));
            operations.push(SqSTestUtils.sendMessageToQueue('delivered', '{"id":"' + rebill_id +'"}'));
        }

        return Promise.all(operations)
            .then(() => permissionutilities.enableACLs())
            .catch(() => permissionutilities.enableACLs());
    }

});

