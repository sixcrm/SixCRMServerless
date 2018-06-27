const request = require('supertest');
const chai = require('chai');
const expect = require('chai').expect;
const fs = require('fs');

const tu = require('@6crm/sixcrmcore/util/test-utilities').default;
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;

const minute = 60 * 1000;

chai.use(require('chai-json-schema'));

let endpoint = global.integration_test_config.endpoint;
let customerGraph = {
	create: {
		name: "create",
		query: global.SixCRM.routes.path('handlers','/endpoints/graph/queries/create/createCustomer.json')
	},
	delete: {
		name: "delete",
		query: global.SixCRM.routes.path('handlers','endpoints/graph/queries/delete/deleteCustomer.json')
	}
};

let searchGraph = {
	search: {
		name: "search",
		query: global.SixCRM.routes.path('handlers','endpoints/graph/queries/uncategorized/getSearchResultsForCustomerId.json')
	}
};

let this_request = request(endpoint);

// Technical Debt: This test is heavy with timeouts. Run it asynchronously so it doesn't block the others.
describe('Customer indexing test', function() {

	let test_user = global.test_users[0];
	let test_account = global.test_accounts[0];
	let test_jwt = tu.createTestAuth0JWT(test_user.email, global.SixCRM.configuration.site_config.jwt.site.secret_key);
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

					let results = response.body.response.search.hits.hit;

					expect(results[0]).to.be.defined;
					expect(results.length).to.equal(1, 'Search index should have the entity.');
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

					let results = response.body.response.search.hits.hit;

					expect(results.length).to.equal(0, 'Search index should not have the entity anymore.');

					done();
				});

		}, 3.5 * minute);
	});


});
