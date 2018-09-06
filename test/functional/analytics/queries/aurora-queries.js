require('../../../config/global.js');
const mockery = require('mockery');
const Mocha = require('mocha');
const chai = require('chai');
chai.use(require('chai-shallow-deep-equal'));
const expect = chai.expect;
const _ = require('lodash');
const path = require('path');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const AnalyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');
const analyticsController = new AnalyticsController();
const fileutilities = require('@6crm/sixcrmcore/util/file-utilities').default;
const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');
const auroraContext = require('@6crm/sixcrmcore/util/analytics/aurora-context').default;
const AuroraSchemaDeployment = global.SixCRM.routes.include('deployment', 'aurora/aurora-schema-deployment.js');
const auroraSchemaDeployment = new AuroraSchemaDeployment();
const DynamoDBDeployment = global.SixCRM.routes.include('deployment', 'utilities/dynamodb-deployment.js');

const mocha = new Mocha({

	reporter: 'spec',
	timeout: 5000

});

const querySuite = Mocha.Suite.create(mocha.suite, 'aurora-queries.js');

const suites = fileutilities.getDirectoryList(path.join(__dirname, 'tests'));

suites.map((suite) => {

	const subSuite = Mocha.Suite.create(querySuite, suite);

	const testDirectories = getDirectories(path.join(__dirname, 'tests', suite));

	const tests = testDirectories.map((testDirectory) => {

		return prepareTest(testDirectory);

	});

	tests.map((test) => {

		subSuite.addTest(new Mocha.Test(test.test_case, async () => {

			const account = test.account || '*';
			PermissionTestGenerators.givenUserWithAllowed('*', '*', account);

			await prepareDatabase();

			const result = await analyticsController[test.method](test.input);

			// const fs = require('fs');
			// await fs.writeFileSync(test.test_case + '.json', JSON.stringify(result));

			const result_name = test.result_name;
			const result_value = (result_name === "undefined") ? result : result[result_name];

			expect(result_value).to.not.equal(undefined, 'Response is missing "' + result_name + '" property. Response is: ' + JSON.stringify(result));

			return expect(result_value).to.be.eql(test.expect);

		}));

	});

});

async function prepareDatabase() {

	await auroraSchemaDeployment.destroy();

	await auroraSchemaDeployment.deploy({
		fromRevision: 0
	});

	await seedDatabase();
	await seedDynamo();

}

function prepareTest(suite) {

	const test = require(path.join(suite, 'config.json'));
	test.directory = path.basename(suite);
	return test;

}

async function seedDatabase() {

	du.debug(`Seeding Test database`);

	const seedPaths = path.join(__dirname, 'seeds', 'aurora');
	const seeds = fileutilities.getDirectoryFilesSync(seedPaths);

	await auroraContext.withConnection((async connection => {

		for (const seed of seeds) {

			await connection.query(fileutilities.getFileContentsSync(path.join(seedPaths, seed)));

		}

	}));

}

async function seedDynamo() {

	du.debug(`Seeding Test database`);

	const seedPaths = path.join(__dirname, 'seeds', 'dynamo');
	const seeds = fileutilities.getDirectoryFilesSync(seedPaths);

	const db = new DynamoDBDeployment();
	await db.initializeControllers();

	for (const seed of seeds) {

		const dataSeeds = JSON.parse(fileutilities.getFileContentsSync(path.join(seedPaths, seed)));

		await db.executeSeedViaController({
			Table: {
				TableName: dataSeeds.table
			}
		}, dataSeeds.seeds)

	}

}

function getDirectories(root) {

	const directories = fileutilities.getDirectoryList(root);

	return _.reduce(directories, ((m, d) => {

		const files = fileutilities.getDirectoryFilesSync(path.join(root, d));

		if (_.includes(files, 'config.json')) {

			m.push(path.join(root, d));

		}

		m.push(...getDirectories(path.join(root, d)));

		return m;

	}), []);

}

querySuite.beforeAll(() => {

	mockery.enable({
		useCleanCache: true,
		warnOnReplace: false,
		warnOnUnregistered: false
	});

	mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sns-provider.js'), class {

		publish() {

			return Promise.resolve();

		}

		getRegion() {

			return 'localhost';

		}

	});


	mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {

		sendMessage() {

			return Promise.resolve();

		}

	});


	global.account = '99999999-999e-44aa-999e-aaa9a99a9999';
	global.user = 'admin.user@test.com';
	global.SixCRM.setResource('auroraContext', auroraContext);
	return auroraContext.init();

});

querySuite.afterAll(() => {

	mockery.resetCache();
	mockery.deregisterAll();

	const auroraContext = global.SixCRM.getResource('auroraContext');
	return auroraContext.dispose();

});

mocha.run((failures) => {
	if (failures > 0) {
		process.exit(1);
	}
});
