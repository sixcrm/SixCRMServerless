const request = require('supertest');
const chai = require('chai');
const assert = require('chai').assert;

const tu = require('@6crm/sixcrmcore/util/test-utilities').default;
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;

let endpoint = global.integration_test_config.endpoint;

let test = {
	name: "uncategorized",
	query: global.SixCRM.routes.path('handlers', 'endpoints/graph/queries/uncategorized/connectiontest.json')
};

let test_user = {
	name: 'Known User',
	email: 'super.user@test.com'
};

let this_request = request(endpoint);
let account = '*';

describe('Connection Test', () => {

	it('successfully connects to configured services', (done) => {

		var test_jwt = tu.createTestAuth0JWT(test_user.email, global.SixCRM.configuration.site_config.jwt.site.secret_key);

		var query = tu.getQuery(test.query);

		this_request.post('graph/' + account)
			.set('Authorization', test_jwt)
			.send(query)
			.expect(200)
			.expect('Content-Type', 'application/json')
			.end(function (err, response) {

				du.debug(response.body);

				if (err) {
					return done(err);
				}

				const connection_tests = response.body.response.data.connectiontest;

				objectutilities.map(connection_tests, key => {
					assert.equal(connection_tests[key].status, 'OK');
				})
				done();

			});

	});

});
