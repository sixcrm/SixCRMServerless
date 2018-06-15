const expect = require('chai').expect;
const uuidV4 = require('uuid/v4');
const SqSTestUtils = require('./sqs-test-utils');
const SQSDeployment = global.SixCRM.routes.include('deployment', 'utilities/sqs-deployment.js');
const sqsDeployment = new SQSDeployment();
const SQSProvider = global.SixCRM.routes.include('controllers', 'providers/sqs-provider.js');
const sqsprovider = new SQSProvider();
const randomutilities = require('@sixcrm/sixcrmcore/util/random').default;
const DynamoDBDeployment = global.SixCRM.routes.include('deployment', 'utilities/dynamodb-deployment.js');
const dynamoDBDeployment = new DynamoDBDeployment();
const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const arrayutilities = require('@sixcrm/sixcrmcore/util/array-utilities').default;
const LambdaProvider = global.SixCRM.routes.include('controllers', 'providers/lambda-provider.js');
const lambdaprovider = new LambdaProvider();
const timestamp = require('@sixcrm/sixcrmcore/util/timestamp').default;
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');
const RebillController = global.SixCRM.routes.include('controllers', 'entities/Rebill.js');
const BBPromise = require('bluebird');

describe('stateMachineDocker', () => {
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

		configureLambdas();

		dynamoDBDeployment.destroyTables()
			.then(() => dynamoDBDeployment.deployTables())
			.then(() => sqsDeployment.deployQueues())
			.then(() => sqsDeployment.purgeQueues())
			.then(() => dynamoDBDeployment.seedTables())
			.then(() => done());

	});

	after((done) => {
		Promise.all([
			sqsDeployment.purgeQueues(),
			dynamoDBDeployment.destroyTables()
		]).then(() => done());
	});

	describe('Database is ready', () => {

		it('should write rebill to database', () => {
			let rebillController = new RebillController();
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
				.then(() => sqsprovider.receiveMessages({queue: 'bill'}))
				.then((messages) => expect(messages[0].Body).to.deep.equal(body))

		});

	});

	describe('Pick Rebill To Bill', () => {

		let rebillController = new RebillController();
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

		let rebill_processing = {
			bill_at: timestamp.getISO8601(),
			id: uuidV4(),
			account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
			processing: 'true',
			parentsession: '1fc8a2ef-0db7-4c12-8ee9-fcb7bc6b075d',
			product_schedules: ["2200669e-5e49-4335-9995-9c02f041d91b"],
			amount: randomutilities.randomDouble(1, 200, 2),
			created_at:timestamp.getISO8601(),
			updated_at:timestamp.getISO8601()
		};

		let rebill_in_past = {
			bill_at: timestamp.convertToISO8601(timestamp.yesterday()),
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

		du.info('REBILL ID ' + rebill.id);

		it('15 rebills should be picked from dynamo and moved to bill', () => {

			let create_rebills = [];

			for (let i = 0; i < 15; i++) {
				create_rebills.push(rebillController.create({ entity: {
					bill_at: timestamp.getISO8601(),
					id: uuidV4(),
					account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
					parentsession: '1fc8a2ef-0db7-4c12-8ee9-fcb7bc6b075d',
					product_schedules: ["2200669e-5e49-4335-9995-9c02f041d91b"],
					amount: randomutilities.randomDouble(1, 200, 2),
					created_at:timestamp.getISO8601(),
					updated_at:timestamp.getISO8601()
				} }));
			}

			return Promise.all(create_rebills)
				.then(() => timestamp.delay(2 * 1000)())
				.then(() => flushStateMachine())
				.then(() => SqSTestUtils.messageCountInQueue('bill'))
				.then((count) => expect(count).to.be.above(14, 'No messages in bill queue.'))
		});

		it('1 rebill should be picked from dynamo and moved to bill', () => {

			return flushStateMachine()
				.then(() => rebillController.get({id: rebill.id}))
				.then(rebill => expect(rebill.state).to.equal('bill'))
				.then(() => SqSTestUtils.messageCountInQueue('bill'))
				.then((count) => expect(count).to.be.above(0, 'No message in bill queue.'))
		});

		it('ignores rebills that are already in state `processing`', () => {

			return sqsDeployment.purgeQueues()
				.then(() => rebillController.create({entity: rebill_processing}))
				.then(() => flushStateMachine())
				.then(() => rebillController.get({id: rebill_processing.id}))
				.then(rebill => expect(rebill.state).to.equal(undefined))
				.then(() => SqSTestUtils.messageCountInQueue('bill'))
				.then((count) => expect(count).to.be.equal(0, 'No message should be in bill queue.'))
		});

		it('ignores rebills in past', () => {

			return sqsDeployment.purgeQueues()
				.then(() => rebillController.create({entity: rebill_in_past}))
				.then(() => flushStateMachine())
				.then(() => rebillController.get({id: rebill_processing.id}))
				.then(rebill => expect(rebill.state).to.equal(undefined))
				.then(() => SqSTestUtils.messageCountInQueue('bill'))
				.then((count) => expect(count).to.be.equal(0, 'No message should be in bill queue.'))
		});

		it('updates rebill processing', () => {

			return rebillController.get({id: rebill.id})
				.then(rebill => expect(rebill.processing).to.equal(true))
		});

	});

	describe('Bill To Hold', () => {

		let rebillController = new RebillController();
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

		let non_existant_id = '5e595e15-e0d9-4f9a-a381-484594820d34'; //this is not in the system

		before((done) => {
			Promise.all([
				rebillController.create({entity: rebill}),
				SqSTestUtils.sendMessageToQueue('bill', '{"id":"' + rebill.id +'"}'),
				SqSTestUtils.sendMessageToQueue('bill', '{"id":"' + non_existant_id +'"}')
			]).then(() => done());
		});

		xit('rebill should move from bill to hold and update its state', () => {

			return rebillController.get({id: rebill.id})
				.then(rebill => expect(rebill.state).to.equal('bill'))
				.then(() => flushStateMachine())
				.then(() => rebillController.get({id: rebill.id}))
				.then(rebill => expect(rebill.state).to.equal('hold'))
		});

		it('missing rebill should cause the message to go to error', () => {

			return () => flushStateMachine()
				.then(() => SqSTestUtils.messageCountInQueue('bill_error'))
				.then((count) => expect(count).to.be.above(0, 'No message in bill_error queue.'))
		});

	});

	describe('Hold To Pending', () => {

		let rebillController = new RebillController();
		let rebill = {
			bill_at: timestamp.getISO8601(),
			id: uuidV4(),
			state: 'hold',
			processing: true,
			account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
			parentsession: '1fc8a2ef-0db7-4c12-8ee9-fcb7bc6b075d',
			product_schedules: ["2200669e-5e49-4335-9995-9c02f041d91b"],
			amount: randomutilities.randomDouble(1, 200, 2),
			created_at:timestamp.getISO8601(),
			updated_at:timestamp.getISO8601()
		};

		let non_existant_id = '5e595e15-e0d9-4f9a-a381-484594820d34'; //this is not in the system

		before((done) => {
			Promise.all([
				rebillController.create({entity: rebill}),
				SqSTestUtils.sendMessageToQueue('hold', '{"id":"' + rebill.id +'"}'),
				SqSTestUtils.sendMessageToQueue('hold', '{"id":"' + non_existant_id +'"}')
			]).then(() => done());
		});

		xit('rebill should move from hold to pending and update its state', () => {

			return rebillController.get({id: rebill.id})
				.then(rebill => expect(rebill.state).to.equal('hold'))
				.then(() => flushStateMachine())
				.then(() => rebillController.get({id: rebill.id}))
				.then(rebill => expect(rebill.state).to.equal('pending'))
		});

		it('missing rebill should cause the message to go to error', () => {

			return () => flushStateMachine()
				.then(() => SqSTestUtils.messageCountInQueue('hold_error'))
				.then((count) => expect(count).to.be.above(0, 'No message in hold_error queue.'))
		});

	});

	describe('Pending To Shipped', () => {

		let rebillController = new RebillController();
		let rebill = {
			bill_at: timestamp.getISO8601(),
			id: uuidV4(),
			state: 'pending',
			processing: true,
			account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
			parentsession: '1fc8a2ef-0db7-4c12-8ee9-fcb7bc6b075d',
			product_schedules: ["2200669e-5e49-4335-9995-9c02f041d91b"],
			amount: randomutilities.randomDouble(1, 200, 2),
			created_at:timestamp.getISO8601(),
			updated_at:timestamp.getISO8601()
		};

		let non_existant_id = '5e595e15-e0d9-4f9a-a381-484594820d34'; //this is not in the system

		before((done) => {
			Promise.all([
				rebillController.create({entity: rebill}),
				SqSTestUtils.sendMessageToQueue('pending', '{"id":"' + rebill.id +'"}'),
				SqSTestUtils.sendMessageToQueue('pending', '{"id":"' + non_existant_id +'"}')
			]).then(() => done());
		});

		it('rebill should move from pending to pending_error when transactions are missing', () => {

			return rebillController.get({id: rebill.id})
				.then(rebill => expect(rebill.state).to.equal('pending'))
				.then(() => flushStateMachine())
				.then(() => rebillController.get({id: rebill.id}))
				.then(rebill => expect(rebill.state).to.equal('pending_error'))
		});

		it('missing rebill should cause the message to go to error', () => {

			return () => flushStateMachine()
				.then(() => SqSTestUtils.messageCountInQueue('pending_error'))
				.then((count) => expect(count).to.be.above(0, 'No message in pending_error queue.'))
		});

	});

	describe('Shipped To Delivered', () => {

		let rebillController = new RebillController();
		let rebill = {
			bill_at: timestamp.getISO8601(),
			id: uuidV4(),
			state: 'shipped',
			processing: true,
			account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
			parentsession: '1fc8a2ef-0db7-4c12-8ee9-fcb7bc6b075d',
			product_schedules: ["2200669e-5e49-4335-9995-9c02f041d91b"],
			amount: randomutilities.randomDouble(1, 200, 2),
			created_at:timestamp.getISO8601(),
			updated_at:timestamp.getISO8601()
		};

		let non_existant_id = '5e595e15-e0d9-4f9a-a381-484594820d34'; //this is not in the system

		before((done) => {
			Promise.all([
				rebillController.create({entity: rebill}),
				SqSTestUtils.sendMessageToQueue('shipped', '{"id":"' + rebill.id +'"}'),
				SqSTestUtils.sendMessageToQueue('shipped', '{"id":"' + non_existant_id +'"}')
			]).then(() => done());
		});

		it('rebill should move from shipped to shipped_error when transactions are missing', () => {

			return rebillController.get({id: rebill.id})
				.then(rebill => expect(rebill.state).to.equal('shipped'))
				.then(() => flushStateMachine())
				.then(() => rebillController.get({id: rebill.id}))
				.then(rebill => expect(rebill.state).to.equal('shipped_error'))
		});

		it('missing rebill should cause the message to go to error', () => {
			return () => flushStateMachine()
				.then(() => SqSTestUtils.messageCountInQueue('shipped_error'))
				.then((count) => expect(count).to.be.above(0, 'No message in shipped_error queue.'))
		});
	});

	describe('Delivered To Archive', () => {

		let rebillController = new RebillController();
		let rebill = {
			bill_at: timestamp.getISO8601(),
			id: uuidV4(),
			state: 'delivered',
			processing: true,
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
				SqSTestUtils.sendMessageToQueue('delivered', '{"id":"' + rebill.id +'"}')
			]).then(() => done());
		});

		it('rebill should move from delivered and be archived', () => {

			process.env.archivefilter = 'all';

			return rebillController.get({id: rebill.id})
				.then(rebill => expect(rebill.state).to.equal('delivered'))
				.then(() => flushStateMachine())
				.then(() => rebillController.get({id: rebill.id}))
				.then(rebill => expect(rebill.state).to.equal('archived'))
				.then(() => sqsprovider.receiveMessages({queue: 'delivered'}))
				.then((messages) => expect(messages.length).to.equal(0))
				.then(() => sqsprovider.receiveMessages({queue: 'delivered_failed'}))
				.then((messages) => expect(messages.length).to.equal(0))
				.then(() => sqsprovider.receiveMessages({queue: 'delivered_error'}))
				.then((messages) => expect(messages.length).to.equal(0))
		});

		it('rebill should stay in delivered if filter is noship and product is ship (noaction)', () => {

			process.env.archivefilter = 'noship';

			return Promise.all([
				rebillController.update({entity: rebill}),
				SqSTestUtils.sendMessageToQueue('delivered', '{"id":"' + rebill.id +'"}')
			])
				.then(() => rebillController.get({id: rebill.id}))
				.then(rebill => expect(rebill.state).to.equal('delivered'))
				.then(() => flushStateMachine())
				.then(() => rebillController.get({id: rebill.id}))
				.then(rebill => expect(rebill.state).to.equal('delivered'))
				.then(() => SqSTestUtils.messageCountInQueue('delivered'))
				.then((count) => expect(count).to.equal(1, 'Message should stay in the queue.'))
		});

	});

	describe('Hold To Archive', () => {

		let rebillController = new RebillController();
		let rebill = {
			bill_at: timestamp.getISO8601(),
			id: uuidV4(),
			state: 'hold',
			processing: true,
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
				SqSTestUtils.sendMessageToQueue('hold', '{"id":"' + rebill.id +'"}')
			]).then(() => done());
		});

		it('rebill should move from hold and be archived', () => {

			process.env.archivefilter = 'all';

			return rebillController.get({id: rebill.id})
				.then(rebill => expect(rebill.state).to.equal('hold'))
				.then(() => flushStateMachine())
				.then(() => timestamp.delay(2 * 1000)())
				.then(() => rebillController.get({id: rebill.id}))
				.then(rebill => expect(rebill.state).to.equal('archived'))
				.then(() => sqsprovider.receiveMessages({queue: 'hold'}))
				.then((messages) => expect(messages.length).to.equal(0))
				.then(() => sqsprovider.receiveMessages({queue: 'hold_failed'}))
				.then((messages) => expect(messages.length).to.equal(0))
				.then(() => sqsprovider.receiveMessages({queue: 'hold_error'}))
				.then((messages) => expect(messages.length).to.equal(0))
		});

	});

	describe('Recover To Archive', () => {

		let rebillController = new RebillController();
		let rebill = {
			bill_at: timestamp.getISO8601(),
			id: uuidV4(),
			state: 'recover',
			processing: true,
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
				SqSTestUtils.sendMessageToQueue('recover', '{"id":"' + rebill.id +'"}')
			]).then(() => done());
		});

		it('rebill should move from recover and be archived', () => {

			process.env.archivefilter = 'all';

			return rebillController.get({id: rebill.id})
				.then(rebill => expect(rebill.state).to.equal('recover'))
				.then(() => flushStateMachine())
				.then(() => rebillController.get({id: rebill.id}))
				.then(rebill => expect(rebill.state).to.equal('archived'))
				.then(() => sqsprovider.receiveMessages({queue: 'recover'}))
				.then((messages) => expect(messages.length).to.equal(0))
				.then(() => sqsprovider.receiveMessages({queue: 'recover_failed'}))
				.then((messages) => expect(messages.length).to.equal(0))
				.then(() => sqsprovider.receiveMessages({queue: 'recover_error'}))
				.then((messages) => expect(messages.length).to.equal(0))
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

});

