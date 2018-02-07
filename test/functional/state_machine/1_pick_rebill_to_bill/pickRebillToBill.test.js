const expect = require('chai').expect;
const mockery = require('mockery');
const uuidV4 = require('uuid/v4');
const SqSTestUtils = require('../../sqs-test-utils');
const TestUtils = require('../../test-utils');
const StateMachine = require('../state-machine-test-utils.js');
const SQSDeployment = global.SixCRM.routes.include('deployment', 'utilities/sqs-deployment.js');
const sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');
const permissionutilities = global.SixCRM.routes.include('lib', 'permission-utilities.js');
const randomutilities = global.SixCRM.routes.include('lib', 'random.js');
const DynamoDbDeployment = global.SixCRM.routes.include('deployment', 'utilities/dynamodb-deployment.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const lambdautilities = global.SixCRM.routes.include('lib', 'lambda-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const fileutilities = global.SixCRM.routes.include('lib', 'file-utilities.js');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');
const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');
const redshiftSchemaDeployment = global.SixCRM.routes.include('deployment', 'utilities/redshift-schema-deployment.js');
const rebillController = global.SixCRM.routes.include('entities', 'Rebill.js');

describe('pickRebillToBill', () => {

    let tests = [];
    let test_dirs = fileutilities.getDirectoryList(__dirname);

    arrayutilities.map(test_dirs, (test_dir) => {
        let test_path = __dirname + '/' + test_dir;

        if (fileutilities.fileExists(test_path + '/test.json')) {
            let config = require(test_path + '/test.json');
            let test = { seeds: {}, expectations: {} };
            test.description = config.description;
            test.path = test_path;


            if (fileutilities.fileExists(test_path + '/seeds')) {
                if (fileutilities.fileExists(test_path + '/seeds/dynamodb')) {
                    test.seeds.dynamodb = fileutilities.getDirectoryFilesSync(test_path + '/seeds/dynamodb');
                }
                if (fileutilities.fileExists(test_path + '/seeds/sqs')) {
                    test.seeds.sqs = fileutilities.getDirectoryFilesSync(test_path + '/seeds/sqs');
                }
            }

            if (fileutilities.fileExists(test_path + '/expectations')) {
                if (fileutilities.fileExists(test_path + '/expectations/dynamodb')) {
                    test.expectations.dynamodb = fileutilities.getDirectoryFilesSync(test_path + '/expectations/dynamodb');
                }
                if (fileutilities.fileExists(test_path + '/expectations/sqs')) {
                    test.expectations.sqs = fileutilities.getDirectoryFilesSync(test_path + '/expectations/sqs');
                }
            }

            tests.push(test);
        } else {
            console.log('Ignoring ' + test_path);
        }

    });

    before((done) => {
        process.env.require_local = true;
        process.env.stage = 'local';

        Promise.resolve()
            .then(() => DynamoDbDeployment.initializeControllers())
            .then(() => DynamoDbDeployment.destroyTables())
            .then(() => DynamoDbDeployment.deployTables())
            .then(() => SQSDeployment.deployQueues())
            .then(() => SQSDeployment.purgeQueues())
            // .then(() => DynamoDbDeployment.seedTables())
            // .then(() => redshiftSchemaDeployment.destroy())
            // .then(() => redshiftSchemaDeployment.deployTables())
            // .then(() => redshiftSchemaDeployment.seed())
            .then(() => done());

    });

    arrayutilities.map(tests, (test) => {
        it(test.description, () => {
            let rebills_after = [];

            return DynamoDbDeployment.purgeTables()
                .then(() => seedDynamo(test))
                .then(() => seedSqs(test))
                .then(() => StateMachine.flush())
                .then(() => rebills())
                .then((rebills) => rebills_after = rebills)
                .then(() => compareRebills(rebills_after, test));
        })
    });

    function seedDynamo(test) {
        if (!test.seeds.dynamodb) {
          return Promise.resolve();
        }

        permissionutilities.disableACLs();

        let promises = [];
        test.seeds.dynamodb.forEach(seed => {
            let table_name = seed.replace('.json', '');
            let seed_file_path = test.path + '/seeds/dynamodb/' + seed;
            promises.push(DynamoDbDeployment.executeSeedViaController(
                { Table: {
                    TableName: table_name
                }},
                require(seed_file_path)
            ));
        });

        return Promise.all(promises)
            .then(() => permissionutilities.enableACLs())
            .catch(() => permissionutilities.enableACLs());
    }

    function seedSqs() {
        return Promise.resolve();
    }

    function rebills() {
        permissionutilities.disableACLs();

        return rebillController.list({pagination:{limit: 100}})
            .then((response) => {
                permissionutilities.enableACLs();
                return response.rebills;
            });
    }

    function compareRebills(rebills, test) {
        let expected = require(test.path + '/expectations/dynamodb/rebills.json').sort();

        expected.sort((a,b) => a.id < b.id);
        rebills.sort((a,b) => a.id < b.id);

        for (let i = 0; i < expected.length; i++) {
            for(let key in expected[i]) {
                expect(rebills[i][key]).to.deep.equal(expected[i][key], key + ' is not the same in rebill with id '+ rebills[i].id);
            }
        }
    }

});

