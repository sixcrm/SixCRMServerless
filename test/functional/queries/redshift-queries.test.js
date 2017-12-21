const fs = require('fs');
const chai = require('chai');

chai.use(require('chai-shallow-deep-equal'));
const expect = chai.expect;

const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const analyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');
const fileutilities = global.SixCRM.routes.include('lib', 'file-utilities.js');
const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');
const redshiftqueryutilities = global.SixCRM.routes.include('lib', 'redshift-query-utilities.js');
const redshiftSchemaDeployment = global.SixCRM.routes.include('deployment', 'utilities/redshift-schema-deployment.js');

describe('queries/redshift-queries.js', () => {

    let tests = [];

    const test_directory = __dirname + '/fixtures';
    let test_dirs = fileutilities.getDirectoryList(test_directory);

    arrayutilities.map(test_dirs, (dir) => {
        tests.push(prepareTest(dir));
    });

    before(() => {
        global.account = '99999999-999e-44aa-999e-aaa9a99a9999';
        global.user = 'admin.user@test.com';

        process.env.TEST_IMAGE = "true";
    });

    arrayutilities.map(tests, (test) => {
        beforeEach((done) => {
            dropDatabase(test)
                .then(() => createTables(test))
                .then(() => seedDatabase(test))
                .then(() => done());
        });

        it(`returns results from ${test.method}`, () => {
            PermissionTestGenerators.givenUserWithAllowed(test.method, 'analytics');
            return analyticsController.executeAnalyticsFunction(test.input, test.method).then((result) => {

                expect(result[test.result_name]).to.shallowDeepEqual(test.expect);
            });

        });
    });

    function prepareTest(dir) {
        let directory = test_directory + '/' + dir + '/';
        let test = require(directory + '/config.json');

        test.directory = directory;
        test.seeds = test.directory + 'seeds/';
        return test;
    }

    function seedDatabase(test) {
        let seeds = fileutilities.getDirectoryFilesSync(test.seeds);
        let seed_promises = [];

        arrayutilities.map(seeds, (seed) => {
            let query = fileutilities.getFileContentsSync(test.seeds + seed);

            seed_promises.push(() => redshiftqueryutilities.query(query));
        });

        return arrayutilities.serial(seed_promises);
    }

    function dropDatabase() {
        return Promise.resolve();
    }

    function createTables() {
        return redshiftSchemaDeployment.deployTables();
    }

});
