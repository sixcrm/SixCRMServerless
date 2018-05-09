const request = require('supertest');
const chai = require('chai');
const assert = require('chai').assert;
const tu = global.SixCRM.routes.include('lib', 'test-utilities.js');

chai.use(require('chai-json-schema'));

let test_name = 'Rebills current';

let test_query = global.SixCRM.routes.include('handlers', 'endpoints/graph/queries/analytics/reports/rebills-current/rebills-current.json');

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

let this_request = request(global.integration_test_config.endpoint);

describe('Get ' + test_name + ' Test', function () {

	let test_jwt = tu.createTestAuth0JWT(test_user.email, global.SixCRM.configuration.site_config.jwt.site.secret_key);

	it('Should return return a 200 HTTP response code and a correctly formatted response', function (done) {

		this_request.post('graph/' + account.id, {
			timeout: 5000
		})
			.set('Authorization', test_jwt)
			.send(test_query.body)
			.expect(200)
			.expect('Content-Type', 'application/json')
			.expect('Access-Control-Allow-Origin', '*')
			.expect('Access-Control-Allow-Methods', 'OPTIONS,POST')
			.expect('Access-Control-Allow-Headers', 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token')
			.end(function (err, response) {

				if (err) {

					// du.warning(err);

				}

				assert.isObject(response.body.response, JSON.stringify(response.body));

				assert.isTrue(tu.validateGraphResponse(response.body.response.data.analyticsfacets, 'analytics/reports/analytics-reports'));

				done();

			});

	});

});
