const chai = require('chai');

chai.use(require('chai-shallow-deep-equal'));
const expect = chai.expect;

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const analyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');
const fileutilities = global.SixCRM.routes.include('lib', 'file-utilities.js');
const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');
const auroraContext = global.SixCRM.routes.include('lib', 'analytics/aurora-context.js');
const auroraSchemaDeployment = global.SixCRM.routes.include('deployment', 'utilities/aurora-schema-deployment.js');
const BBPromise = require('bluebird');
const path = require('path');

before((done) => {

	global.account = '99999999-999e-44aa-999e-aaa9a99a9999';
	global.user = 'admin.user@test.com';
	global.SixCRM.setResource('auroraContext', auroraContext);

	auroraContext.init()
		.then(() => {

			return done();

		})
		.catch((ex) => {

			done(ex);

		});

});

after((done) => {

	const auroraContext = global.SixCRM.getResource('auroraContext');

	auroraContext.dispose()
		.then(() => {

			return done();

		})
		.catch((ex) => {

			done(ex);

		});

});

describe('Push events to RDS', () => {

	const suiteDirectory = path.join(__dirname, 'tests');
	const suites = fileutilities.getDirectoryList(suiteDirectory).filter(test => !test.includes('*'));
	const tests = suites.map((d) => {

		return prepareTest(path.join(suiteDirectory, d));

	});

	tests.map((test) => {

		it(test.name, () => {

			return prepareDatabase(test).then(() => {

				return console.log('YEAH');

			});

		});

	});

});

function prepareDatabase(test) {

	return dropDatabase()
		.then(() => createTables())
		.then(() => seedDatabase(test));

}

function prepareTest(dir) {

	const test = require(path.join(dir, 'config.json'));
	test.directory = dir;
	test.seeds = path.join(dir, 'seeds');

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

			return connection.query(fileutilities.getFileContentsSync(test.seeds + seed));

		}), (p) => p);

	}));

}

function dropDatabase() {

	return auroraSchemaDeployment.destroy();

}

function createTables() {

	return auroraSchemaDeployment.deployTables();

}