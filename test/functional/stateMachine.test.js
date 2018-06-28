const expect = require('chai').expect;
const mockery = require('mockery');
const SqSTestUtils = require('./sqs-test-utils');
const TestUtils = require('./test-utils');
const SQSDeployment = global.SixCRM.routes.include('deployment', 'utilities/sqs-deployment.js');
const sqsDeployment = new SQSDeployment();
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
const LambdaProvider = global.SixCRM.routes.include('controllers', 'providers/lambda-provider.js');
const lambdaprovider = new LambdaProvider();
const timestamp = require('@6crm/sixcrmcore/util/timestamp').default;
const BBPromise = require('bluebird');


describe('stateMachine', () => {
	let lambdas = [];
	let lambda_names = [
		'billtohold',
		'recovertohold',
		'holdtopending',
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

		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});

		TestUtils.setGlobalUser();
		TestUtils.setEnvironmentVariables();
		configureLambdas();

		sqsDeployment.deployQueues().then(() => SqSTestUtils.purgeAllQueues()).then(() => done());
	});

	beforeEach((done) => {
		let RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');

		RebillHelperController.prototype.updateRebillState = () => {
			return Promise.resolve();
		};
		RebillHelperController.prototype.getAvailableRebillsAsMessages = () => {
			return Promise.resolve([]);
		};

		mockWorkerFunctions();

		SqSTestUtils.purgeAllQueues().then(() => done());
	});

	afterEach(() => {
		delete require.cache[require.resolve(global.SixCRM.routes.path('helpers', 'entities/rebill/Rebill.js'))];
	});


	after((done) => {
		SqSTestUtils.purgeAllQueues().then(() => done());
	});

	describe('Flush', () => {

		it('should execute all lambdas', () => {

			flushStateMachine()
				.then(results => {
					expect(results.length).to.equal(lambdas.length);
				});
		});

	});

	xdescribe('Moving messages', () => {

		let tests = [
			{from: 'bill', to: 'hold', worker: 'processBilling.js', status: 'success', messages: 0},
			{from: 'bill', to: 'hold', worker: 'processBilling.js', status: 'success', messages: 1},
			{from: 'bill', to: 'hold', worker: 'processBilling.js', status: 'success', messages: 9},
			{from: 'bill', to: 'hold', worker: 'processBilling.js', status: 'success', messages: 10},
			{from: 'bill', to: 'hold', worker: 'processBilling.js', status: 'success', messages: 11},
			{from: 'bill', to: 'hold', worker: 'processBilling.js', status: 'success', messages: 21},
			{from: 'bill', to: 'recover', worker: 'processBilling.js', status: 'fail', messages: 1},
			{from: 'bill', to: 'bill', worker: 'processBilling.js', status: 'noaction', messages: 1},
			{from: 'bill', to: 'bill_error', worker: 'processBilling.js', status: 'error', messages: 1},
			{from: 'hold', to: 'pending', worker: 'shipProduct.js', status: 'success', messages: 1},
			{from: 'hold', to: 'hold_failed', worker: 'shipProduct.js', status: 'fail', messages: 1},
			{from: 'hold', to: 'hold', worker: 'shipProduct.js', status: 'noaction', messages: 5},
			{from: 'pending', to: 'shipped', worker: 'confirmShipped.js', status: 'success', messages: 1},
			{from: 'recover', to: 'hold', worker: 'recoverBilling.js', status: 'success', messages: 1},
			{from: 'shipped', to: 'delivered', worker: 'confirmDelivered.js', status: 'success', messages: 1}
		];

		arrayutilities.map(tests, (test) => {
			it(`should move ${test.messages} message(es) from ${test.from} to ${test.to}`, () => {

				let rebill = JSON.stringify(getRebill(test.status));

				let expected_number_in_input = 0;
				let expected_number_in_output = test.messages;
				let error_message = 'Message(es) not delivered to destination queue.';

				if (test.status === 'noaction') {
					expected_number_in_input = expected_number_in_output;
					error_message = 'Message moved out of input queue.'
				}

				return SqSTestUtils.sendMessageToQueue(test.from, rebill, test.messages)
					.then(() => SqSTestUtils.messageCountInQueue(test.from))
					.then((count) => expect(count).to.equal(test.messages, 'Message(es) not delivered to input queue.'))
					.then(() => flushStateMachine())
					.then(() => Promise.all([
						SqSTestUtils.messageCountInQueue(test.from),
						SqSTestUtils.messageCountInQueue(test.to)]))
					.then((counts) => expect(counts).to.deep.equal(
						[expected_number_in_input, expected_number_in_output], error_message))

			});
		});

	});

	describe('Archiving messages', () => {

		let tests = [
			{from: 'hold'},
			{from: 'delivered'},
			{from: 'rebill'},
			{from: 'recover'}
		];

		arrayutilities.map(tests, (test) => {
			it(`should archive a message from ${test.from}`, () => {

				let rebill = JSON.stringify(getRebill(test.status));

				return SqSTestUtils.messageCountInQueue(test.from)
					.then((count) => expect(count).to.equal(0, 'Queue is not empty at the start of test.'))
					.then(() => SqSTestUtils.sendMessageToQueue(test.from, rebill))
					.then(() => SqSTestUtils.messageCountInQueue(test.from))
					.then((count) => expect(count).to.equal(1, 'Message was not delivered to input queue.'))
					.then(() => flushStateMachine())
					.then(() => SqSTestUtils.messageCountInQueue(test.from))
					.then((count) => expect(count).to.equal(0, 'Message was left in input queue.'))
			});
		});
	});

	describe('Mix and match', () => {

		let tests = [
			{
				description: 'should move things around',
				start_state: [
					{queue: 'bill', status: 'success', messages: 1},
					{queue: 'hold', status: 'success', messages: 2},
					{queue: 'hold', status: 'fail', messages: 1}
				],

				number_of_flushes: 1,

				end_state: [
					{queue: 'bill', messages: 0},
					{queue: 'hold', messages: 1},
					{queue: 'pending', messages: 2},
					{queue: 'hold_failed', messages: 1}
				]

			},
			{
				description: 'should move messages out of bill to fail and error queues',
				start_state: [
					{queue: 'bill', status: 'success', messages: 1},
					{queue: 'bill', status: 'error', messages: 1},
					{queue: 'bill', status: 'fail', messages: 1},
					{queue: 'bill', status: 'noaction', messages: 1}
				],

				number_of_flushes: 1,

				end_state: [
					{queue: 'hold', messages: 1},
					{queue: 'bill_error', messages: 1},
					{queue: 'recover', messages: 1},
					{queue: 'bill', messages: 1}
				]

			},
			{
				description: 'should move messages out of hold to fail and error queues',
				start_state: [
					{queue: 'hold', status: 'success', messages: 1},
					{queue: 'hold', status: 'error', messages: 1},
					{queue: 'hold', status: 'fail', messages: 1},
					{queue: 'hold', status: 'noaction', messages: 1}
				],

				number_of_flushes: 1,

				end_state: [
					{queue: 'pending', messages: 1},
					{queue: 'hold_error', messages: 1},
					{queue: 'hold_failed', messages: 1},
					{queue: 'hold', messages: 1}
				]

			},
			{
				description: 'should move messages out of pending to fail and error queues',
				start_state: [
					{queue: 'pending', status: 'success', messages: 1},
					{queue: 'pending', status: 'error', messages: 1},
					{queue: 'pending', status: 'fail', messages: 1},
					{queue: 'pending', status: 'noaction', messages: 1}
				],

				number_of_flushes: 1,

				end_state: [
					{queue: 'shipped', messages: 1},
					{queue: 'pending_error', messages: 1},
					{queue: 'pending_failed', messages: 1},
					{queue: 'pending', messages: 1}
				]

			},
			{
				description: 'should move messages out of shipped to fail and error queues',
				start_state: [
					{queue: 'shipped', status: 'success', messages: 1},
					{queue: 'shipped', status: 'error', messages: 1},
					{queue: 'shipped', status: 'fail', messages: 1},
					{queue: 'shipped', status: 'noaction', messages: 1}
				],

				number_of_flushes: 1,

				end_state: [
					{queue: 'delivered', messages: 1},
					{queue: 'shipped_error', messages: 1},
					{queue: 'shipped_failed', messages: 1},
					{queue: 'shipped', messages: 1}
				]

			}
		];

		arrayutilities.map(tests, (test) => {
			it(test.description, () => {

				let begin = [];

				arrayutilities.map(test.start_state, (state) => {
					let rebill = JSON.stringify(getRebill(state.status));

					begin.push(SqSTestUtils.sendMessageToQueue(state.queue, rebill, state.messages))
				});

				return Promise.all(begin)
					.then(() => flushStateMachine())
					.then(() => {
						let end = [];

						arrayutilities.map(test.end_state, (state) => {
							end.push(SqSTestUtils.messageCountInQueue(state.queue))
						});

						return Promise.all(end);
					})
					.then((counts) => {
						test.end_state.forEach((state, i) => {
							expect(counts[i]).to.equal(state.messages, `Number of messages in queue '${state.queue}' is incorrect.`);
						})
					})

			});

		});

	});

	describe('Incorrect message', () => {

		it(`valid JSON stays in the queue`, () => {

			let message = JSON.stringify({not_a_rebill: 'but still valid JSON'});

			return SqSTestUtils.sendMessageToQueue('bill', message)
				.then(() => SqSTestUtils.messageCountInQueue('bill'))
				.then((count) => expect(count).to.equal(1, 'Message(es) not delivered to input queue.'))
				.then(() => flushStateMachine())
				.then(() => SqSTestUtils.messageCountInQueue('bill'))
				.then((count) => expect(count).to.equal(1, 'Message(es) no longer in the input queue.'))
		});

		it(`invalid JSON also stays in the queue`, () => {

			let message = "abc123";

			return SqSTestUtils.sendMessageToQueue('bill', message)
				.then(() => SqSTestUtils.messageCountInQueue('bill'))
				.then((count) => expect(count).to.equal(1, 'Message(es) not delivered to input queue.'))
				.then(() => flushStateMachine())
				.then(() => SqSTestUtils.messageCountInQueue('bill'))
				.then((count) => expect(count).to.equal(1, 'Message(es) no longer in the input queue.'))
		});


	});

	describe('Flushing queue twice', () => {

		let tests = [
			{
				from: 'bill',
				to: 'hold',
				eventually: 'pending',
				worker: 'processBilling.js',
				status: 'success',
				messages: 1
			}
		];

		arrayutilities.map(tests, (test) => {
			it(`should move ${test.messages} message(es) from ${test.from} to ${test.to} end eventually to ${test.eventually}`, () => {

				let rebill = JSON.stringify(getRebill(test.status));

				let expected_number_in_input = 0;
				let expected_number_in_output = test.messages;
				let error_message = 'Message(es) not delivered to destination queue.';

				return SqSTestUtils.sendMessageToQueue(test.from, rebill, test.messages)
					.then(() => SqSTestUtils.messageCountInQueue(test.from))
					.then((count) => expect(count).to.equal(test.messages, 'Message(es) not delivered to input queue.'))
					.then(() => flushStateMachine())
					.then(() => Promise.all([
						SqSTestUtils.messageCountInQueue(test.from),
						SqSTestUtils.messageCountInQueue(test.to)]))
					.then((counts) => expect(counts).to.deep.equal(
						[expected_number_in_input, expected_number_in_output], error_message))
					.then(() => timestamp.delay(32 * 1000)())
					.then(() => flushStateMachine())
					.then(() => Promise.all([
						SqSTestUtils.messageCountInQueue(test.from),
						SqSTestUtils.messageCountInQueue(test.eventually)]))
					.then((counts) => expect(counts).to.deep.equal(
						[expected_number_in_input, expected_number_in_output], error_message))

			});
		});


	});

	function flushStateMachine() {
		let all_function_executions = BBPromise.mapSeries(lambdas, (lambda) => {
			return lambda(null, null, () => {});
		});

		return all_function_executions.then((results) => {
			return timestamp.delay(0.3 * 1000)().then(() => results);
		});
	}

	function configureLambdas() {
		arrayutilities.map(lambda_names, (lambda_name) => {
			lambdas.push(lambdaprovider.getLambdaInstance(lambda_name));
		});
	}

	function mockWorkerFunctions() {
		arrayutilities.map(global.SixCRM.routes.files('controllers', `workers`), (worker_function) => {
			mockery.registerMock(global.SixCRM.routes.path('controllers', `workers/${worker_function}`), {
				execute: (message) => {
					const WorkerResponse = class {
						getCode() {
							let body = JSON.parse(message.Body);

							return body.return_status ? body.return_status : 'success';
						}

						getAdditionalInformation() {
							let body = JSON.parse(message.Body);

							return body.return_status ? body.return_status : 'success';
						}
					};

					return Promise.resolve(new WorkerResponse());
				}
			});
		});
	}

	function getRebill(status) {

		return {
			"bill_at": "2017-04-06T18:40:41.405Z",
			"id": "70de203e-f2fd-45d3-918b-460570338c9b",
			"account": "d3fa3bf3-7824-49f4-8261-87674482bf1c",
			"parentsession": "1fc8a2ef-0db7-4c12-8ee9-fcb7bc6b075d",
			"product_schedules": ["2200669e-5e49-4335-9995-9c02f041d91b"],
			"amount": 79.99,
			"created_at": "2017-04-06T18:40:41.405Z",
			"updated_at": "2017-04-06T18:41:12.521Z",
			"return_status": status
		};

	}

});

