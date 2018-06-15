require('../state-machine-test-setup');
const uuidV4 = require('uuid/v4');
const SqSTestUtils = require('../../sqs-test-utils');
const StateMachine = require('../state-machine-test-utils.js');
const SQSDeployment = global.SixCRM.routes.include('deployment', 'utilities/sqs-deployment.js');
const sqsDeployment = new SQSDeployment();
const permissionutilities = require('@sixcrm/sixcrmcore/util/permission-utilities').default;
const DynamoDbDeployment = global.SixCRM.routes.include('deployment', 'utilities/dynamodb-deployment.js');
const dynamoDbDeployment = new DynamoDbDeployment();
const randomutilities = require('@sixcrm/sixcrmcore/util/random').default;
const timestamp = require('@sixcrm/sixcrmcore/util/timestamp').default;
const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const Timer = global.SixCRM.routes.include('controllers', 'providers/timer.js');
const RebillController = global.SixCRM.routes.include('controllers', 'entities/Rebill.js');
const rebillController = new RebillController();
const ProductController = global.SixCRM.routes.include('controllers', 'entities/Product.js');
const TransactionController = global.SixCRM.routes.include('entities', 'Transaction.js');
const transactionController = new TransactionController();
const MockEntities = global.SixCRM.routes.include('test','mock-entities.js');
const numberUtilities = require('@sixcrm/sixcrmcore/util/number-utilities').default;
const productController = new ProductController();
const timer = new Timer();
const tab = '      ';

const max_test_cases = randomutilities.randomInt(5, 9);

describe('holdToArchiveStressTest', () => {

	let number_of_incorrect = 0;
	let number_of_ignored = 0;
	let lambda_filter = ["holdtoarchive"];

	before((done) => {
		process.env.require_local = true;
		process.env.archivefilter = 'noship';

		Promise.resolve()
			.then(() => dynamoDbDeployment.initializeControllers())
			.then(() => dynamoDbDeployment.destroyTables())
			.then(() => dynamoDbDeployment.deployTables())
			.then(() => sqsDeployment.deployQueues())
			.then(() => sqsDeployment.purgeQueues())
			.then(() => done());

	});

	it(`${max_test_cases} rebills are sent to archive`, () => {
		return beforeTest()
			.then(() => waitForNumberOfMessages('hold', max_test_cases))
			.then(() => du.info(tab + 'Waiting for flush to finish'))
			.then(() => timer.set())
			.then(() => StateMachine.flush(lambda_filter))
			.then(() => waitForNumberOfMessages('hold', number_of_ignored))
			.then(() => waitForNumberOfMessages('hold_error', number_of_incorrect))
			.then(() => {
				let total = timer.get();

				du.info(tab + 'Total processing time: ' + total + 'ms');
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

	function seed() {
		permissionutilities.disableACLs();

		let operations = [];

		for (let i = 0; i < max_test_cases; i++) {
			let rebill = MockEntities.getValidRebill();
			let transaction = MockEntities.getValidTransaction();
			let product_ship = randomutilities.randomBoolean();

			let rebill_id = [rebill.id, uuidV4()];
			let transaction_rebill = [transaction.rebill, rebill.id];

			//create random scenarios
			rebill_id = randomutilities.selectRandomFromArray(rebill_id);
			transaction.rebill = randomutilities.selectRandomFromArray(transaction_rebill);

			//prepare data
			rebill.state = "hold";
			rebill.processing = true;

			transaction.products.forEach(transaction_product => {
				let product = MockEntities.getValidProduct(transaction_product.product.id);

				product.ship = product_ship;
				operations.push(productController.create({entity: product}));
			});

			//missing rebill goes to error
			//rebill without transaction goes to error
			if ((rebill.id !== rebill_id) ||
                (transaction.rebill !== rebill.id))
				number_of_incorrect++;

			//rebill is not archived if product should be shipped
			else if (product_ship) number_of_ignored++;

			operations.push(rebillController.create({entity: rebill}));
			operations.push(transactionController.create({entity: transaction}));
			operations.push(SqSTestUtils.sendMessageToQueue('hold', '{"id":"' + rebill_id +'"}'));
		}

		return Promise.all(operations)
			.then(() => permissionutilities.enableACLs())
			.catch(() => permissionutilities.enableACLs());
	}
});

