const request = require('supertest');
const chai = require('chai');
const expect = require('chai').expect;
const fs = require('fs');
const tu = require('../../../lib/test-utilities.js');
const minute = 60 * 1000;

chai.use(require('chai-json-schema'));

let endpoint = global.integration_test_config.endpoint;
let customerGraph = {
    create: {
        name: "create",
        query: "./endpoints/graph/queries/create/createCustomer"
    },
    delete: {
        name: "delete",
        query: "./endpoints/graph/queries/delete/deleteCustomer"
    }
};

let searchGraph = {
    search: {
        name: "search",
        query: "./endpoints/graph/queries/uncategorized/getSearchResultsForCustomerId"
    }
};

let this_request = request(endpoint);

describe('Customer indexing test', function() {

    let test_user = global.test_users[0];
    let test_account = global.test_accounts[0];
    let test_jwt = tu.createTestAuth0JWT(test_user.email, global.site_config.jwt.auth0.secret_key);
    let account = test_account.id;

    it('Customer is available in index after creation and not available after delete', (done) => {
        let createCustomer = tu.getQuery(customerGraph.create.query);
        let deleteCustomer = tu.getQuery(customerGraph.delete.query);
        let searchCustomer = tu.getQuery(searchGraph.search.query);

        // create a customer
        this_request.post('graph/'+account)
            .set('Authorization', test_jwt)
            .send(createCustomer)
            .end((err, response) => {
                expect(err).not.to.be.defined;
                expect(response).to.be.defined;
            });

        // after some time check the index, it should be there
        setTimeout(() => {
            this_request.post('graph/'+account)
                .set('Authorization', test_jwt)
                .send(searchCustomer)
                .end((err, response) => {
                    expect(err).not.to.be.defined;
                    expect(response).to.be.defined;

                    let results = response.body.data.search.hits.hit;

                    expect(results[0]).to.be.defined;
                    expect(results.length).to.equal(1);
                    expect(results[0].id).to.equal('b5803b28-c584-4bb3-8fac-3315b91686b3');

                    // delete a customer
                    this_request.post('graph/'+account)
                        .set('Authorization', test_jwt)
                        .send(deleteCustomer)
                        .end((err, response) => {
                            expect(err).not.to.be.defined;
                            expect(response).to.be.defined;
                        });
                });

        }, 1.5 * minute);

        // after some more time it should no longer be in the index
        setTimeout(() => {

            this_request.post('graph/'+account)
                .set('Authorization', test_jwt)
                .send(searchCustomer)
                .end((err, response) => {
                    expect(err).not.to.be.defined;
                    expect(response).to.be.defined;

                    let results = response.body.data.search.hits.hit;

                    expect(results.length).to.equal(0);

                    done();
                });

        }, 3.1 * minute);
    });


});