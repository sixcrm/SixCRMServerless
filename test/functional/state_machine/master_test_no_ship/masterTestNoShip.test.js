require('../state-machine-test-setup');
const expect = require('chai').expect;
const SqSTestUtils = require('../../sqs-test-utils');
const StateMachine = require('../state-machine-test-utils.js');
const SQSDeployment = global.SixCRM.routes.include('deployment', 'utilities/sqs-deployment.js');
const sqsDeployment = new SQSDeployment();
const permissionutilities = global.SixCRM.routes.include('lib', 'permission-utilities.js');
const DynamoDbDeployment = global.SixCRM.routes.include('deployment', 'utilities/dynamodb-deployment.js');
const dynamoDbDeployment = new DynamoDbDeployment();
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const fileutilities = global.SixCRM.routes.include('lib', 'file-utilities.js');
const RebillController = global.SixCRM.routes.include('controllers', 'entities/Rebill.js');
const rebillController = new RebillController();
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const tab = '      ';

xdescribe('masterTestNoShip', () => {

	let tests = [];
	let test_dirs = fileutilities.getDirectoryList(__dirname);

	arrayutilities.map(test_dirs, (test_dir) => {
		let test_path = __dirname + '/' + test_dir;

		if (fileutilities.fileExists(test_path + '/test.json')) {
			let config = require(test_path + '/test.json');
			let test = { seeds: {}, expectations: {} };

			test.description = config.description;
			test.path = test_path;
			test.lambda_filter = config.lambda_filter;
			test.order = config.order || Number.MAX_SAFE_INTEGER;
			test.env = config.env;
			test.only = config.only;

			if (fileutilities.fileExists(test_path + '/seeds')) {
				if (fileutilities.fileExists(test_path + '/seeds/dynamodb')) {
					test.seeds.dynamodb = fileutilities.getDirectoryFilesSync(test_path + '/seeds/dynamodb');
				}
				if (fileutilities.fileExists(test_path + '/seeds/sqs')) {
					test.seeds.sqs = fileutilities.getDirectoryFilesSync(test_path + '/seeds/sqs');
				}
			}

			if (fileutilities.fileExists(test_path + '/expectations')) {
				if (fileutilities.fileExists(test_path + '/expectations/dynamodb')) {
					test.expectations.dynamodb = fileutilities.getDirectoryFilesSync(test_path + '/expectations/dynamodb');
				}
				if (fileutilities.fileExists(test_path + '/expectations/sqs')) {
					test.expectations.sqs = fileutilities.getDirectoryFilesSync(test_path + '/expectations/sqs');
				}
			}

			if (!config.skip) {
				tests.push(test);
			}

			test.description = stringutilities.replaceAll(test.description,', ', '\n' + tab);

		} else {
			du.info('Ignoring ' + test_path);
		}

	});
	tests.sort((a, b) => a.order - b.order);
	if (arrayutilities.filter(tests, test => test.only).length > 0 ) {
		tests = arrayutilities.filter(tests, test => test.only);
	}

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

	arrayutilities.map(tests, (test) => {
		it(test.description, () => {
			return beforeTest(test)
				.then(() => StateMachine.flush(test.lambda_filter))
				.then(() => du.info(tab+'(Waiting 30s for messages to propagate between state machine flushes)'))
				.then(() => timestamp.delay(32 * 1000)())
				.then(() => StateMachine.flush(test.lambda_filter))
				.then(() => du.info(tab+'(Waiting 30s for messages to propagate between state machine flushes)'))
				.then(() => timestamp.delay(32 * 1000)())
				.then(() => StateMachine.flush(test.lambda_filter))
				.then(() => verifyRebills(test))
				.then(() => verifySqs(test))
		})
	});

	function beforeTest(test) {
		return Promise.resolve()
			.then(() => sqsDeployment.purgeQueues())
			.then(() => dynamoDbDeployment.destroyTables())
			.then(() => dynamoDbDeployment.deployTables())
			.then(() => seedDynamo(test))
			.then(() => seedSqs(test))
			.then(() => {
				for (let key in test.env) {
					process.env[key] = test.env[key];
				}
			})
	}

	function seedDynamo(test) {
		if (!test.seeds.dynamodb) {
			return Promise.resolve();
		}

		permissionutilities.disableACLs();

		let promises = [];

		test.seeds.dynamodb.forEach(seed => {
			let table_name = seed.replace('.json', '');
			let seed_file_path = test.path + '/seeds/dynamodb/' + seed;

			promises.push(dynamoDbDeployment.executeSeedViaController(
				{ Table: {
					TableName: table_name
				}},
				require(seed_file_path)
			));
		});

		return Promise.all(promises)
			.then(() => permissionutilities.enableACLs())
			.catch(() => permissionutilities.enableACLs());
	}

	function seedSqs(test) {
		if (!test.seeds.sqs) {
			return Promise.resolve();
		}

		let promises = [];

		test.seeds.sqs.forEach(seed => {
			let queue_name = seed.replace('.json', '');
			let seed_file_path = test.path + '/seeds/sqs/' + seed;
			let messages = require(seed_file_path);

			messages.forEach(message => {
				promises.push(SqSTestUtils.sendMessageToQueue(queue_name, JSON.stringify(message)));
			});

		});

		return Promise.all(promises);
	}

	function rebills() {
		permissionutilities.disableACLs();

		return rebillController.list({pagination:{limit: 100}})
			.then((response) => {
				permissionutilities.enableACLs();
				return response.rebills;
			});
	}

	function verifySqs(test) {

		if (test.expectations.sqs) {

			let comparations = [];

			test.expectations.sqs.forEach(queue_definition => {
				let expected_queue = require(test.path + '/expectations/sqs/' + queue_definition);
				let queue_name = queue_definition.replace('.json', '');

				comparations.push(SqSTestUtils.messageCountInQueue(queue_name)
					.then(count => {
						return expect(count).to.equal(expected_queue.length, `Expected ${expected_queue.length} messages in ${queue_name} but got ${count}`);
					}));
			});
			return Promise.all(comparations);
		} else {
			return Promise.resolve();
		}

	}

	function verifyRebills(test) {
		return rebills()
			.then((rebills) => {
				rebills = rebills || [];
				let expected = require(test.path + '/expectations/dynamodb/rebills.json');

				expected.sort((a,b) => a.id.localeCompare(b.id));
				rebills.sort((a,b) => a.id.localeCompare(b.id));

				for (let i = 0; i < expected.length; i++) {
					for(let key in expected[i]) {
						expect(rebills[i][key]).to.deep.equal(
							expected[i][key],
							'"' + key + '" is not the same in rebill with id '+ rebills[i].id);
					}
				}
			})

	}

});

