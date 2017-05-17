const request = require('supertest');
const chai = require('chai');
const fs = require('fs');
const yaml = require('js-yaml');

const tu = global.routes.include('lib','test-utilities.js');
const du = global.routes.include('lib','debug-utilities.js');

chai.use(require('chai-json-schema'));

let endpoint = global.integration_test_config.endpoint;

const entity = 'Notifications';
const tests = [
    {
        name: "index",
        query: global.routes.path('handlers','endpoints/graph/queries/index/getNotifications')
    },
    {
        name: "view",
        query: global.routes.path('handlers','endpoints/graph/queries/view/getNotification')
    },
    {
        name: "create",
        query: global.routes.path('handlers','endpoints/graph/queries/create/createNotification')
    },
    {
        name: "update",
        query: global.routes.path('handlers','endpoints/graph/queries/update/updateNotification')
    },
    {
        name: "delete",
        query: global.routes.path('handlers','endpoints/graph/queries/delete/deleteNotification')
    }
];

let this_request = request(endpoint);

describe('Graph ' + entity + ' Test', function () {

    // Technical Debt: Debug and enable this test for other accounts as well.
    global.test_accounts.filter(account => account.id === '*').forEach((test_account) => {

        global.test_users.forEach((test_user) => {

            describe(`Test the graph ${entity} endpoint using "${test_user.name}" credentials on the account "${test_account.name}"`, function () {

                let test_jwt = tu.createTestAuth0JWT(test_user.email, global.site_config.jwt.auth0.secret_key);

                tests.forEach((test) => {

                    let account = test_account.id;

                    it(`Should return only ${test_user.name} fields for ${entity} ${test.name}.`, function (done) {
                        let query = tu.getQuery(test.query);

                        this_request.post('graph/' + account)
                            .set('Authorization', test_jwt)
                            .send(query)
                            .expect(200)
                            .expect('Content-Type', 'application/json')
                            .expect('Access-Control-Allow-Origin', '*')
                            .expect('Access-Control-Allow-Methods', 'OPTIONS,POST')
                            .expect('Access-Control-Allow-Headers', 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token')
                            .end(function (err, response) {
                                tu.assertResultSet(response, test_user.role);
                                done();
                            });
                    });
                });

            });

        });

    });

});
