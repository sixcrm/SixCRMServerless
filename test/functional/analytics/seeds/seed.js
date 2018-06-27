require('../../../config/global.js');
const mockery = require('mockery');
const path = require('path');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const fileutilities = require('@6crm/sixcrmcore/util/file-utilities').default;
const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');
const auroraContext = require('@6crm/sixcrmcore/util/analytics/aurora-context').default;
const AuroraSchemaDeployment = global.SixCRM.routes.include('deployment', 'aurora/aurora-schema-deployment.js');
const auroraSchemaDeployment = new AuroraSchemaDeployment();
const DynamoDBDeployment = global.SixCRM.routes.include('deployment', 'utilities/dynamodb-deployment.js');

mockery.enable({
	useCleanCache: true,
	warnOnReplace: false,
	warnOnUnregistered: false
});

mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {

	sendMessage() {

		return Promise.resolve();

	}

});

mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sns-provider.js'), class {

	publish() {

		return Promise.resolve();

	}

	getRegion() {

		return 'localhost';

	}

});

PermissionTestGenerators.givenUserWithAllowed('*', '*', '*');

prepareDatabase().catch((ex) => {
	throw ex;
});

async function prepareDatabase() {

	await seedDatabase();
	await seedDynamo();

}

async function seedDatabase() {

	du.debug(`Seeding Test database`);

	await auroraSchemaDeployment.destroy();

	await auroraSchemaDeployment.deploy({
		fromRevision: 0
	});

	const seedPaths = path.join(__dirname, 'aurora');
	const seeds = fileutilities.getDirectoryFilesSync(seedPaths);

	await auroraContext.withConnection((async connection => {

		for (const seed of seeds) {

			await connection.query(fileutilities.getFileContentsSync(path.join(seedPaths, seed)));

		}

	}));

}

async function seedDynamo() {

	du.debug(`Seeding Test database`);

	const seedPaths = path.join(__dirname, 'dynamo');
	const seeds = fileutilities.getDirectoryFilesSync(seedPaths);

	const db = new DynamoDBDeployment();
	await db.initializeControllers();
	// await db.destroyTables();
	// await db.deployTables();

	for (const seed of seeds) {

		const dataSeeds = JSON.parse(fileutilities.getFileContentsSync(path.join(seedPaths, seed)));

		await db.executeSeedViaController({
			Table: {
				TableName: dataSeeds.table
			}
		}, dataSeeds.seeds)

	}

}
