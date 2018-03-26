const chai = require('chai');

chai.use(require('chai-shallow-deep-equal'));
const expect = chai.expect;
const path = require('path');
const _ = require('underscore');
const SQSTestUtils = require('../../sqs-test-utils');
const AnalyticsEventHandler = require('../../../../controllers/workers/analytics/analytics-event-handler');


const fileutilities = global.SixCRM.routes.include('lib', 'file-utilities.js');
const SQSDeployment = global.SixCRM.routes.include('deployment', 'utilities/sqs-deployment.js');
const auroraContext = global.SixCRM.routes.include('lib', 'analytics/aurora-context.js');
const auroraSchemaDeployment = global.SixCRM.routes.include('deployment', 'utilities/aurora-schema-deployment.js');

before(() => {

	return Promise.resolve()
		.then(() => SQSDeployment.deployQueues());

});

beforeEach(() => {

	return Promise.resolve()
		.then(() => SQSDeployment.purgeQueues())
		.then(() => auroraSchemaDeployment.destroy())
		.then(() => auroraSchemaDeployment.deployTables());

})

describe('Push events to RDS', () => {

	const suiteDirectory = path.join(__dirname, 'tests');
	const suites = fileutilities.getDirectoryList(suiteDirectory).filter(test => !test.includes('*'));
	const tests = suites.map((d) => {

		return prepareTest(path.join(suiteDirectory, d));

	});

	tests.map((test) => {

		it(test.name, () => {

			return auroraContext.withConnection((connection) => {

				const aeh = new AnalyticsEventHandler('rds_transaction_batch', auroraContext);

				return seedSQS(test)
					.then(() => SQSTestUtils.messageCountInQueue('rds_transaction_batch'))
					.then((count) => {

						return expect(count === test.count);

					})
					.then(() => aeh.execute())
					.then(() => test.validate(connection))
					.then(() => SQSTestUtils.messageCountInQueue('rds_transaction_batch'))
					.then((count) => {

						return expect(count === 0);

					});

			});

		});

	});

});

function prepareTest(dir) {

	const test = require(path.join(dir, 'config.json'));
	test.directory = dir;
	test.seeds = {};
	test.validate = require(path.join(dir, 'validate.js'));

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

		const seedFilePath = path.join(test.directory, 'seeds', 'sqs', seed);
		const seedContent = require(seedFilePath);
		test.count = seedContent.messages.count;

		memo.push(...seedContent.messages.map(message => {

			return SQSTestUtils.sendMessageToQueue('rds_transaction_batch', JSON.stringify(message), 1);

		}));

		return memo;

	}, []);

	return Promise.all(promises);

}