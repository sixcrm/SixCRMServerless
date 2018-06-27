const request = require('supertest');
const chai = require('chai');
const assert = require('chai').assert;
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const tu = require('@6crm/sixcrmcore/util/test-utilities').default;

chai.use(require('chai-json-schema'));

let test_name = 'Rebill summary';

let test_query = global.SixCRM.routes.include('handlers', 'endpoints/graph/queries/analytics/reports/rebill-summary/rebill-summary.json');

//set the test user
let test_user = {
	name: "Super User",
	email: "super.user@test.com",
	role: "Owner"
};

//set the test account
let account = {
	name: 'Master Account',
	id: '*'
};

let req = request(global.integration_test_config.endpoint);

describe('Get ' + test_name + ' Test', () => {

	let test_jwt = tu.createTestAuth0JWT(test_user.email, global.SixCRM.configuration.site_config.jwt.site.secret_key);

	it('Should return return a 200 HTTP response code and a correctly formatted response', (done) => {

		req.post('graph/' + account.id, {
			timeout: 5000
		})
			.set('Authorization', test_jwt)
			.send(test_query.body)
			.expect(200)
			.expect('Content-Type', 'application/json')
			.end(function (err, response) {

				if (err) {

					du.error(err);

					done(err);

				} else {

					assert.isObject(response.body.response, JSON.stringify(response.body));

					assert.isTrue(tu.validateGraphResponse(response.body.response.data.analytics, 'analytics/reports/analytics-reports'));

					done();

				}

			});

	});

});
