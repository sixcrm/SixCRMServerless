const chai = require('chai');

chai.use(require('chai-shallow-deep-equal'));
// const expect = chai.expect;
const path = require('path');

const fileutilities = global.SixCRM.routes.include('lib', 'file-utilities.js');
const SQSDeployment = global.SixCRM.routes.include('deployment', 'utilities/sqs-deployment.js');
const auroraContext = global.SixCRM.routes.include('lib', 'analytics/aurora-context.js');
const auroraSchemaDeployment = global.SixCRM.routes.include('deployment', 'utilities/aurora-schema-deployment.js');

before(() => {

	global.SixCRM.setResource('auroraContext', auroraContext);

	return Promise.resolve()
		.then(() => SQSDeployment.deployQueues())
		.then(() => SQSDeployment.purgeQueues())
		.then(() => auroraContext.init());

});

after(() => {

	const auroraContext = global.SixCRM.getResource('auroraContext');

	return auroraContext.dispose();

});

describe('Push events to RDS', () => {

	const suiteDirectory = path.join(__dirname, 'tests');
	const suites = fileutilities.getDirectoryList(suiteDirectory).filter(test => !test.includes('*'));
	const tests = suites.map((d) => {

		return prepareTest(path.join(suiteDirectory, d));

	});

	tests.map((test) => {

		it(test.name, () => {

			return prepareDatabase().then(() => {

				return console.log('YEAH');

			});

		});

	});

});

function prepareDatabase() {

	return dropDatabase()
		.then(() => createTables());

}

function prepareTest(dir) {

	const test = require(path.join(dir, 'config.json'));
	test.directory = dir;
	return test;

}

function dropDatabase() {

	return auroraSchemaDeployment.destroy();

}

function createTables() {

	return auroraSchemaDeployment.deployTables();

}