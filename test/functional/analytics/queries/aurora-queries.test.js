const chai = require('chai');
chai.use(require('chai-shallow-deep-equal'));
const expect = chai.expect;
const _ = require('lodash');
const path = require('path');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const AnalyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');
const analyticsController = new AnalyticsController();
const fileutilities = global.SixCRM.routes.include('lib', 'file-utilities.js');
const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');
const auroraContext = global.SixCRM.routes.include('lib', 'analytics/aurora-context.js');
const AuroraSchemaDeployment = global.SixCRM.routes.include('deployment', 'aurora/aurora-schema-deployment.js');
const auroraSchemaDeployment = new AuroraSchemaDeployment();
const BBPromise = require('bluebird');

before(() => {

	global.account = '99999999-999e-44aa-999e-aaa9a99a9999';
	global.user = 'admin.user@test.com';
	global.SixCRM.setResource('auroraContext', auroraContext);
	return auroraContext.init();

});

after(() => {

	const auroraContext = global.SixCRM.getResource('auroraContext');
	return auroraContext.dispose();

});

describe('queries/aurora-queries.js', () => {

	const suites = fileutilities.getDirectoryList(path.join(__dirname, 'tests'));

	arrayutilities.map(suites, (suite) => {

		describe(suite, () => {

			const testDirectories = getDirectories(path.join(__dirname, 'tests', suite));

			const tests = arrayutilities.map(testDirectories, (testDirectory) => {

				return prepareTest(testDirectory);

			});

			arrayutilities.map(tests, (test) => {

				it(test.test_case, () => {

					PermissionTestGenerators.givenUserWithAllowed(test.method, 'analytics');

					return prepareDatabase(test).then(() => {

						return analyticsController.executeAnalyticsFunction(test.input, test.method).then((result) => {

							const result_name = test.result_name;
							const result_value = (result_name === "undefined") ? result : result[result_name];

							expect(result_value).to.not.equal(
								undefined, 'Response is missing "' + result_name + '" property. Response is: ' + JSON.stringify(result));
							// fs.writeFileSync(uuid.v4(), JSON.stringify(result_value));
							return expect(result_value).to.be.eql(test.expect);

						});

					});

				});

			});

		});

	});

});

function prepareDatabase(test) {
	return Promise.resolve()
		.then(() => auroraSchemaDeployment.destroy())
		.then(() => auroraSchemaDeployment.deploy({
			fromRevision: 0
		}))
		.then(() => seedDatabase(test));
}

function prepareTest(suite) {

	const test = require(path.join(suite, 'config.json'));
	test.directory = path.basename(suite);
	test.seeds = path.join(suite, 'seeds');
	return test;

}

function seedDatabase(test) {

	du.debug(`Seeding Test database with ${test.method}`);

	if (!fileutilities.fileExists(test.seeds)) {

		return du.debug('Nothing to seed');

	}

	return auroraContext.withConnection((connection => {

		const seeds = fileutilities.getDirectoryFilesSync(test.seeds);

		return BBPromise.each(seeds.map((seed) => {

			return connection.query(fileutilities.getFileContentsSync(path.join(test.seeds, seed)));

		}), (p) => p);

	}));

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