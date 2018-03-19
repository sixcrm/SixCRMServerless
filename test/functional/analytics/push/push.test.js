const chai = require('chai');

chai.use(require('chai-shallow-deep-equal'));
// const expect = chai.expect;
const path = require('path');
const _ = require('underscore');
const SQSTestUtils = require('../../sqs-test-utils');
const PushTransactionRecords = require('../../../../controllers/workers/analytics/PushTransactionRecords');

const fileutilities = global.SixCRM.routes.include('lib', 'file-utilities.js');
const SQSDeployment = global.SixCRM.routes.include('deployment', 'utilities/sqs-deployment.js');
const auroraContext = global.SixCRM.routes.include('lib', 'analytics/aurora-context.js');
const auroraSchemaDeployment = global.SixCRM.routes.include('deployment', 'utilities/aurora-schema-deployment.js');

before(() => {

	global.SixCRM.setResource('auroraContext', auroraContext);

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

	const auroraContext = global.SixCRM.getResource('auroraContext');

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

			seedSQS(test)
				.then(() => {

					// run the code
					new PushTransactionRecords().execute()
						.then(() => {

							// should check the DB for the records here

							return done();

						});

				})
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
		const messages = require(seedFilePath);

		memo.push(...messages.map(message => {

			return SQSTestUtils.sendMessageToQueue(queueName, JSON.stringify(message), 1);

		}));

		return memo;

	}, []);

	return Promise.all(promises);

}