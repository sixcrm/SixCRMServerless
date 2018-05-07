const request = require('supertest');
const chai = require('chai');
const assert = require('chai').assert;
const fs = require('fs');

const tu = global.SixCRM.routes.include('lib','test-utilities.js');
const du = global.SixCRM.routes.include('lib','debug-utilities.js');

chai.use(require('chai-json-schema'));

let endpoint = global.integration_test_config.endpoint;

let entity = 'User Introspection';
let tests = [{
	name: "view",
	query: global.SixCRM.routes.path('handlers','endpoints/graph/queries/view/getUserIntrospection.json')
}];

let test_users = [
	{
		name: 'Known User',
		email: 'super.user@test.com'
	},
	{
		name: 'Unknown User',
		email: 'unknown.user@test.com'
	}
];

du.info(endpoint);

let this_request = request(endpoint);
let account = '*';

describe('Graph '+entity+' Test', function() {

	test_users.forEach((test_user) => {

		describe('Test the graph '+entity+' endpoint using "'+test_user.name+'" credentials.', function() {

			var test_jwt = tu.createTestAuth0JWT(test_user.email, global.SixCRM.configuration.site_config.jwt.site.secret_key);

			du.info(test_jwt);

			tests.forEach((test) => {

				it('Should return only '+test_user.name+' fields for '+entity+' '+test.name+'.', function (done) {

					var query = tu.getQuery(test.query);

					du.info(query);

					this_request.post('graph/'+account)
						.set('Authorization', test_jwt)
						.send(query)
						.expect(200)
						.expect('Content-Type', 'application/json')
						.expect('Access-Control-Allow-Origin','*')
						.expect('Access-Control-Allow-Methods', 'OPTIONS,POST')
						.expect('Access-Control-Allow-Headers','Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token')
						.end(function(err, response){
							du.info(response.body);
							assert.isTrue(tu.validateGraphResponse(response.body, 'graph'));
							done();
						});
				});
			});

		});

	});

});
