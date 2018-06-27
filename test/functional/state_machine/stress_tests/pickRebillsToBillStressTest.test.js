require('../state-machine-test-setup');
const SqSTestUtils = require('../../sqs-test-utils');
const StateMachine = require('../state-machine-test-utils.js');
const SQSDeployment = global.SixCRM.routes.include('deployment', 'utilities/sqs-deployment.js');
const sqsDeployment = new SQSDeployment();
const permissionutilities = require('@6crm/sixcrmcore/util/permission-utilities').default;
const DynamoDbDeployment = global.SixCRM.routes.include('deployment', 'utilities/dynamodb-deployment.js');
const dynamoDbDeployment = new DynamoDbDeployment();
const randomutilities = require('@6crm/sixcrmcore/util/random').default;
const timestamp = require('@6crm/sixcrmcore/util/timestamp').default;
const Timer = global.SixCRM.routes.include('controllers', 'providers/timer.js');
const RebillController = global.SixCRM.routes.include('controllers', 'entities/Rebill.js');
const rebillController = new RebillController();
const numberUtilities = require('@6crm/sixcrmcore/util/number-utilities').default;
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');
const timer = new Timer();
const tab = '      ';

const max_test_cases = randomutilities.randomInt(100, 200);

describe('pickRebillsToBillStressTest', () => {

	let number_of_ignored = 0;

	before((done) => {
		process.env.require_local = true;

		Promise.resolve()
			.then(() => dynamoDbDeployment.initializeControllers())
			.then(() => dynamoDbDeployment.destroyTables())
			.then(() => dynamoDbDeployment.deployTables())
			.then(() => sqsDeployment.deployQueues())
			.then(() => sqsDeployment.purgeQueues())
			.then(() => done());

	});

	it(`${max_test_cases} rebills are picked from dynamo`, () => {
		return beforeTest()
			.then(() => waitForNumberOfMessages('bill', 0))
			.then(() => du.info(tab + 'Waiting for flush to finish'))
			.then(() => timer.set())
			.then(() => StateMachine.flush())
			.then(() => waitForNumberOfMessages('bill', max_test_cases - number_of_ignored))
			.then(() => {
				let total = timer.get();

				du.info(tab + 'Total processing time: ' + total + ' ms');
				du.info(tab + numberUtilities.formatFloat(total/max_test_cases, 2) + 'ms per message');
			});
	});

	function beforeTest() {
		return Promise.resolve()
			.then(() => sqsDeployment.purgeQueues())
			.then(() => dynamoDbDeployment.destroyTables())
			.then(() => dynamoDbDeployment.deployTables())
			.then(() => seed())
	}

	function seed() {
		permissionutilities.disableACLs();

		let operations = [];

		for (let i = 0; i < max_test_cases; i++) {
			let rebill = MockEntities.getValidRebill();
			let day_in_the_future = "3017-04-06T18:40:41.405Z";
			let bill_at = [timestamp.yesterday(), day_in_the_future];

			//create random scenarios
			rebill.processing = randomutilities.randomBoolean();
			rebill.bill_at = randomutilities.selectRandomFromArray(bill_at);

			//rebill in processing is ignored
			//rebill in future is ignored
			if (rebill.processing ||
                rebill.bill_at === day_in_the_future)
				number_of_ignored++;

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
				du.info(tab + 'Waiting for ' + number + ' messages to be in ' + queue_name + '. Got ' + count);
				if ((number === 0 && count > 0) || (number > 0 && count < number)) {
					return timestamp.delay(1 * 1000)().then(() => waitForNumberOfMessages(queue_name, number, ++retries))
				} else if (number > 0 && count > number) {
					du.info('Too many messages in queue ' + queue_name);
					return Promise.reject('Too many messages in queue ' + queue_name);
				} else {
					return Promise.resolve();
				}
			});
	}

});
