const chai = require('chai');
const _ = require('underscore');

chai.use(require('chai-shallow-deep-equal'));
const expect = chai.expect;

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const AnalyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');
const analyticsController = new AnalyticsController();
const fileutilities = global.SixCRM.routes.include('lib', 'file-utilities.js');
const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');
const auroraContext = global.SixCRM.routes.include('lib', 'analytics/aurora-context.js');
const AuroraSchemaDeployment = global.SixCRM.routes.include('deployment', 'utilities/aurora-schema-deployment.js');
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

	const suite_directory = __dirname + '/tests';
	const suites = fileutilities.getDirectoryList(suite_directory);

	arrayutilities.map(suites, (suite) => {

		describe(suite, () => {

			const tests = [];

			const test_directory = suite_directory + '/' + suite;
			// this is temporary here, ignore tests where second letter is *, not first as we want to keep the folder structure
			const test_dirs = fileutilities.getDirectoryList(test_directory).filter(test => !test.includes('*'));

			arrayutilities.map(test_dirs, (dir) => {

				prepareTest(dir, test_directory, tests);

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

							return equalObjects(result_value, test.expect);

						});

					});

				});

			});

		});

	});

});

function equalObjects(object, expected) {
	for (let key in expected) {
		if (_.isObject(expected[key])) {
			return equalObjects(object[key], expected[key])
		} else {
			if (key === 'datetime' || key === 'period') {
				return expect(object[key]).to.be.defined; // Technical Debt: At least verify it's in the correct format.
			} else {
				return expect(object[key]).to.deep.equal(expected[key]);
			}
		}
	}
}

function prepareDatabase(test) {
	return Promise.resolve()
		.then(() => auroraSchemaDeployment.destroy())
		.then(() => auroraSchemaDeployment.deployTables())
		.then(() => seedDatabase(test));
}

function prepareTest(dir, test_directory, tests) {

	const directory = test_directory + '/' + dir + '/';
	const test = require(directory + '/config.json');

	test.directory = directory;
	test.seeds = test.directory + 'seeds/';

	tests.push(test);

}

function seedDatabase(test) {

	du.debug(`Seeding Test database with ${test.method}`);

	if (!fileutilities.fileExists(test.seeds)) {

		return du.debug('Nothing to seed');

	}

	return auroraContext.withConnection((connection => {

		const seeds = fileutilities.getDirectoryFilesSync(test.seeds);

		return BBPromise.each(seeds.map((seed) => {

			return connection.query(fileutilities.getFileContentsSync(test.seeds + seed));

		}), (p) => p);

	}));

}