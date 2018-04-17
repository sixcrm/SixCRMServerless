const request = require('supertest');
const chai = require('chai');
const assert = require('chai').assert;

const tu = global.SixCRM.routes.include('lib', 'test-utilities.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

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
  		.end(function(err, response) {

  			if (err){
          return done(err);
        }

  			du.output(response.body);
  			const connection_tests = response.body.response.data.connectiontest;
        assert.isObject(connection_tests);
        done();

  		});

  });

});
