const chai = require('chai');

chai.use(require('chai-shallow-deep-equal'));
const expect = chai.expect;
const path = require('path');
const _ = require('underscore');
const SQSTestUtils = require('../../sqs-test-utils');
const PushTransactionRecords = require('../../../../controllers/workers/analytics/PushTransactionRecords');

const fileutilities = global.SixCRM.routes.include('lib', 'file-utilities.js');
const SQSDeployment = global.SixCRM.routes.include('deployment', 'utilities/sqs-deployment.js');
const auroraContext = global.SixCRM.routes.include('lib', 'analytics/aurora-context.js');
const auroraSchemaDeployment = global.SixCRM.routes.include('deployment', 'utilities/aurora-schema-deployment.js');

before(() => {

	return Promise.resolve()
		.then(() => SQSDeployment.deployQueues())
		.then(() => auroraContext.init());

});

beforeEach(() => {

	return Promise.resolve()
		.then(() => SQSDeployment.purgeQueues())
		.then(() => auroraSchemaDeployment.destroy())
		.then(() => auroraSchemaDeployment.deployTables());

})

after(() => {

	return Promise.resolve()
		.then(() => auroraContext.dispose());

});

describe('Push events to RDS', () => {

	const suiteDirectory = path.join(__dirname, 'tests');
	const suites = fileutilities.getDirectoryList(suiteDirectory).filter(test => !test.includes('*'));
	const tests = suites.map((d) => {

		return prepareTest(path.join(suiteDirectory, d));

	});

	tests.map((test) => {

		it(test.name, (done) => {

			const ptr = new PushTransactionRecords(auroraContext);

			seedSQS(test)
				.then(() => SQSTestUtils.messageCountInQueue(ptr.queueName))
				.then((count) => {

					return expect(count === test[ptr.queueName].count);

				})
				.then(() => ptr.execute())
				.then(() => auroraContext.connection.query('SELECT COUNT(1) as c FROM analytics.f_transactions'))
				.then((result) => {

					return expect(result.rows[0].c).to.be.equal(test[ptr.queueName].count.toString());

				})
				.then(() => SQSTestUtils.messageCountInQueue(ptr.queueName))
				.then((count) => {

					return expect(count === 0);

				})
				.then(() => done())
				.catch((ex) => {

					done(ex);

				});

		});

	});

});

function prepareTest(dir) {

	const test = require(path.join(dir, 'config.json'));
	test.directory = dir;
	test.seeds = {};

	if (fileutilities.fileExists(path.join(dir, 'seeds'))) {

		if (fileutilities.fileExists(path.join(dir, 'seeds', 'sqs'))) {

			test.seeds.sqs = fileutilities.getDirectoryFilesSync(path.join(dir, 'seeds', 'sqs'));

		}

	}

	return test;

}

function seedSQS(test) {

	if (!test.seeds || !test.seeds.sqs) {

		return Promise.resolve();

	}

	const promises = _.reduce(test.seeds.sqs, (memo, seed) => {

		const queueName = seed.replace('.json', '');
		const seedFilePath = path.join(test.directory, 'seeds', 'sqs', seed);
		const seedContent = require(seedFilePath);
		test[queueName] = {
			count: seedContent.messages.length
		};

		memo.push(...seedContent.messages.map(message => {

			return SQSTestUtils.sendMessageToQueue(queueName, JSON.stringify(message), 1);

		}));

		return memo;

	}, []);

	return Promise.all(promises);

}