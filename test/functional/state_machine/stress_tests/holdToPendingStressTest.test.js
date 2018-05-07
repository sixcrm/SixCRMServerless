require('../state-machine-test-setup');
const uuidV4 = require('uuid/v4');
const SqSTestUtils = require('../../sqs-test-utils');
const StateMachine = require('../state-machine-test-utils.js');
const SQSDeployment = global.SixCRM.routes.include('deployment', 'utilities/sqs-deployment.js');
const sqsDeployment = new SQSDeployment();
const permissionutilities = global.SixCRM.routes.include('lib', 'permission-utilities.js');
const DynamoDbDeployment = global.SixCRM.routes.include('deployment', 'utilities/dynamodb-deployment.js');
const dynamoDbDeployment = new DynamoDbDeployment();
const randomutilities = global.SixCRM.routes.include('lib', 'random.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const Timer = global.SixCRM.routes.include('controllers', 'providers/timer.js');
const RebillController = global.SixCRM.routes.include('controllers', 'entities/Rebill.js');
const CustomerController = global.SixCRM.routes.include('controllers', 'entities/Customer.js');
const FulfillmentProviderController = global.SixCRM.routes.include('entities', 'FulfillmentProvider.js');
const ProductController = global.SixCRM.routes.include('controllers', 'entities/Product.js');
const SessionController = global.SixCRM.routes.include('entities', 'Session.js');
const TransactionController = global.SixCRM.routes.include('entities', 'Transaction.js');
const MockEntities = global.SixCRM.routes.include('test','mock-entities.js');
const numberUtilities = global.SixCRM.routes.include('lib', 'number-utilities.js');
const rebillController = new RebillController();
const transactionController = new TransactionController();
const customerController = new CustomerController();
const sessionController = new SessionController();
const productController = new ProductController();
const fulfillmentProviderController = new FulfillmentProviderController();
const timer = new Timer();
const tab = '      ';

const max_test_cases = randomutilities.randomInt(50, 90);

describe('holdToPendingStressTest', () => {

	let number_of_incorrect = 0;
	let number_of_ignored = 0;
	let lambda_filter = ["holdtopending"];

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

	it(`${max_test_cases} rebills are sent to pending`, () => {
		return beforeTest()
			.then(() => waitForNumberOfMessages('hold', max_test_cases))
			.then(() => du.info(tab + 'Waiting for flush to finish'))
			.then(() => timer.set())
			.then(() => StateMachine.flush(lambda_filter))
			.then(() => waitForNumberOfMessages('hold', number_of_ignored))
			.then(() => waitForNumberOfMessages('hold_error', number_of_incorrect))
			.then(() => waitForNumberOfMessages('pending', max_test_cases - number_of_incorrect - number_of_ignored))
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

		let fulfillment_provider = getValidFulfillmentProvider();

		for (let i = 0; i < max_test_cases; i++) {
			let rebill = MockEntities.getValidRebill();
			let customer = MockEntities.getValidCustomer();
			let session = MockEntities.getValidSession();
			let product = MockEntities.getValidProduct();
			let transaction = MockEntities.getValidTransaction();

			let rebill_id = [rebill.id, uuidV4()];
			let transaction_rebill = [transaction.rebill, rebill.id];
			let product_id = [product.id, transaction.products[0].product.id];

			//create random scenarios
			rebill_id = randomutilities.selectRandomFromArray(rebill_id);
			product.id = randomutilities.selectRandomFromArray(product_id);
			transaction.rebill = randomutilities.selectRandomFromArray(transaction_rebill);

			//prepare data
			rebill.state = "hold";
			rebill.processing = true;
			session.customer = customer.id;
			session.completed = false;
			session.id = rebill.parentsession;
			session.product_schedules = rebill.product_schedules;
			product.fulfillment_provider = fulfillment_provider.id;
			product.ship = randomutilities.randomBoolean();
			transaction.merchant_provider = "a32a3f71-1234-4d9e-a9a1-98ecedb88f24";
			transaction.products = [transaction.products[0]];

			//missing rebill goes to error
			//rebill without transaction goes to error
			//rebill without product goes to error
			if ((rebill.id !== rebill_id) ||
                (transaction.rebill !== rebill.id) ||
                (transaction.products[0].product.id !== product.id))
				number_of_incorrect++;

			//rebill remains in hold when product should be not shipped
			else if (!product.ship) number_of_ignored++;

			operations.push(rebillController.create({entity: rebill}));
			operations.push(customerController.create({entity: customer}));
			operations.push(sessionController.create({entity: session}));
			operations.push(productController.create({entity: product}));
			operations.push(transactionController.create({entity: transaction}));
			operations.push(SqSTestUtils.sendMessageToQueue('hold', '{"id":"' + rebill_id +'"}'));
		}

		operations.push(fulfillmentProviderController.create({entity: fulfillment_provider}));

		return Promise.all(operations)
			.then(() => permissionutilities.enableACLs())
			.catch(() => permissionutilities.enableACLs());
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

