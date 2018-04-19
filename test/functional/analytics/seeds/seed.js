require('../../../config/global.js');
const mockery = require('mockery');
const path = require('path');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const fileutilities = global.SixCRM.routes.include('lib', 'file-utilities.js');
const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');
const auroraContext = global.SixCRM.routes.include('lib', 'analytics/aurora-context.js');
const AuroraSchemaDeployment = global.SixCRM.routes.include('deployment', 'aurora/aurora-schema-deployment.js');
const auroraSchemaDeployment = new AuroraSchemaDeployment();
const DynamoDBDeployment = global.SixCRM.routes.include('deployment', 'utilities/dynamodb-deployment.js');

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

PermissionTestGenerators.givenUserWithAllowed('*', '*', '*');

prepareDatabase().catch((ex) => console.log(ex));

async function prepareDatabase() {

	await auroraSchemaDeployment.destroy();

	await auroraSchemaDeployment.deploy({
		fromRevision: 0
	});

	await seedDatabase();
	await seedDynamo();

}

async function seedDatabase() {

	du.debug(`Seeding Test database`);

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

	for (const seed of seeds) {

		const dataSeeds = JSON.parse(fileutilities.getFileContentsSync(path.join(seedPaths, seed)));

		await db.executeSeedViaController({
			Table: {
				TableName: dataSeeds.table
			}
		}, dataSeeds.seeds)

	}

}
