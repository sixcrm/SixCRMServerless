const request = require('supertest');
const chai = require('chai');
const assert = require('chai').assert;

const tu = global.SixCRM.routes.include('lib','test-utilities.js');
const du = global.SixCRM.routes.include('lib','debug-utilities.js');

let endpoint = global.integration_test_config.endpoint;

let test = {
    name: "uncategorized",
    query: global.SixCRM.routes.path('handlers','endpoints/graph/queries/uncategorized/checkIP.json')
};

let test_user = {
	name: 'Known User',
	email: 'super.user@test.com'
};

let this_request = request(endpoint);

describe('IP Check Test', function() {

	var test_jwt = tu.createTestAuth0JWT(test_user.email, global.SixCRM.configuration.site_config.jwt.site.secret_key);

	it('Should return an IP address', function (done) {

		var query = tu.getQuery(test.query);

		this_request.post('graph/')
					.set('Authorization', test_jwt)
					.send(query)
					.expect(200)
					.expect('Content-Type', 'application/json')
					.end(function(err, response){

			du.output(response.body);

			assert.isObject(response.body.response);
			assert.match(response.body.response, /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/);

			done();

		});

	});

});
