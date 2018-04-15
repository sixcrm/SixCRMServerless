const chai = require('chai');

chai.use(require('chai-shallow-deep-equal'));
const expect = chai.expect;
const path = require('path');
const _ = require('lodash');
const SQSTestUtils = require('../../sqs-test-utils');
const AnalyticsEventHandler = require('../../../../controllers/workers/analytics/analytics-event-handler');

const fileutilities = global.SixCRM.routes.include('lib', 'file-utilities.js');
const SQSDeployment = global.SixCRM.routes.include('deployment', 'utilities/sqs-deployment.js');
const sqsDeployment = new SQSDeployment();
const auroraContext = global.SixCRM.routes.include('lib', 'analytics/aurora-context.js');
const AuroraSchemaDeployment = global.SixCRM.routes.include('deployment', 'aurora/aurora-schema-deployment.js');
const auroraSchemaDeployment = new AuroraSchemaDeployment();

describe('Push events to RDS', () => {

	before(() => {

		return Promise.resolve()
			.then(() => sqsDeployment.deployQueues());

	});

	beforeEach(() => {

		return Promise.resolve()
			.then(() => sqsDeployment.purgeQueues())
			.then(() => auroraSchemaDeployment.destroy())
			.then(() => auroraSchemaDeployment.deploy());

	})

	const suiteDirectory = path.join(__dirname, 'tests');
	const suites = fileutilities.getDirectoryList(suiteDirectory).filter(test => !test.includes('*'));
	const tests = suites.map((d) => {

		return prepareTest(path.join(suiteDirectory, d));

	});

	tests.map((test) => {

		it(test.name, () => {

			return auroraContext.withConnection((connection) => {

				const aeh = new AnalyticsEventHandler('analytics', auroraContext);

				return Promise.resolve()
					.then(() => seedAurora(test))
					.then(() => seedSQS(test))
					.then(() => SQSTestUtils.messageCountInQueue('analytics'))
					.then((count) => {

						return expect(count === test.count);

					})
					.then(() => aeh.execute())
					.then(() => test.validate(connection))
					.then(() => SQSTestUtils.messageCountInQueue('analytics'))
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

		if (fileutilities.fileExists(path.join(dir, 'seeds', 'aurora'))) {

			test.seeds.aurora = fileutilities.getDirectoryFilesSync(path.join(dir, 'seeds', 'aurora'));

		}

		if (fileutilities.fileExists(path.join(dir, 'seeds', 'sqs'))) {

			test.seeds.sqs = fileutilities.getDirectoryFilesSync(path.join(dir, 'seeds', 'sqs'));

		}

	}

	return test;

}

function seedAurora(test) {

	if (!test.seeds || !test.seeds.aurora) {

		return Promise.resolve();

	}

	const promises = _.reduce(test.seeds.aurora, (memo, seed) => {

		const seedFilePath = path.join(test.directory, 'seeds', 'aurora', seed);
		const script = fileutilities.getFileContentsSync(seedFilePath, 'utf8');

		memo.push(auroraContext.withConnection((connection) => {

			return connection.query(script);

		}));

		return memo;

	}, []);

	return Promise.all(promises);

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

			return SQSTestUtils.sendMessageToQueue('analytics', JSON.stringify(message), 1);

		}));

		return memo;

	}, []);

	return Promise.all(promises);

}
