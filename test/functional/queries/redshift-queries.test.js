const fs = require('fs');
const chai = require('chai');

chai.use(require('chai-shallow-deep-equal'));
const expect = chai.expect;

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const analyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');
const fileutilities = global.SixCRM.routes.include('lib', 'file-utilities.js');
const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');
const redshiftqueryutilities = global.SixCRM.routes.include('lib', 'redshift-query-utilities.js');
const redshiftSchemaDeployment = global.SixCRM.routes.include('deployment', 'utilities/redshift-schema-deployment.js');

describe('queries/redshift-queries.js', () => {

    let tests = [];

    const test_directory = __dirname + '/fixtures';
    // this is temporary here, ignore tests where second letter is *, not first as we want to keep the folder structure
    let test_dirs = fileutilities.getDirectoryList(test_directory).filter(test => !test.includes('*'));

    arrayutilities.map(test_dirs, (dir) => {
        prepareTest(dir);
    });

    before(() => {
        global.account = '99999999-999e-44aa-999e-aaa9a99a9999';
        global.user = 'admin.user@test.com';

        process.env.stage = 'local';
        global.SixCRM.configuration.stage = 'local';
    });

    arrayutilities.map(tests, (test) => {

        it(`returns results from ${test.method}`, () => {
            PermissionTestGenerators.givenUserWithAllowed(test.method, 'analytics');

            return prepareDatabase(test).then(() => {
                return analyticsController.executeAnalyticsFunction(test.input, test.method).then((result) => {
                    let result_name = test.result_name;
                    let result_value = (result_name === "undefined") ? result : result[result_name];

                    expect(result_value).to.not.equal(
                        undefined, 'Response is missing "' + result_name + '" property. Response is: ' + JSON.stringify(result));
                    expect(result_value).to.deep.equal(
                        test.expect, JSON.stringify(result_value) + ' does not equal ' + JSON.stringify(test.expect));
                });
            });


        });

    });

    function prepareDatabase(test) {
        return dropDatabase()
            .then(() => createTables(test))
            .then(() => seedDatabase(test));
    }

    function prepareTest(dir) {
        let directory = test_directory + '/' + dir + '/';
        let test = require(directory + '/config.json');

        test.directory = directory;
        test.seeds = test.directory + 'seeds/';

        tests.push(test);
    }

    function seedDatabase(test) {
        du.debug(`Seeding Test database with ${test.method}`);
        let seeds = fileutilities.getDirectoryFilesSync(test.seeds);

        let seed_promises = [];

        arrayutilities.map(seeds, (seed) => {
            let query = fileutilities.getFileContentsSync(test.seeds + seed);

            du.debug(query)
            seed_promises.push(() => redshiftqueryutilities.query(query));
        });

        return arrayutilities.serial(seed_promises);
    }

    function dropDatabase() {
        return redshiftSchemaDeployment.destroy();
    }

    function createTables() {
        return redshiftSchemaDeployment.deployTables();
    }

});
