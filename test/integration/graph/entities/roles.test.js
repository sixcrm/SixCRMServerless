const request = require('supertest');
const chai = require('chai');
const assert = require('chai').assert

const tu = require('@sixcrm/sixcrmcore/util/test-utilities').default;

chai.use(require('chai-json-schema'));

let endpoint = global.integration_test_config.endpoint;

var entity = 'Roles';
var tests = [{
	name: "index",
	query: global.SixCRM.routes.path('handlers','endpoints/graph/queries/index/getRoles.json')
},
{
	name: "view",
	query: global.SixCRM.routes.path('handlers','endpoints/graph/queries/view/getRole.json')
},
{
	name: "create",
	query: global.SixCRM.routes.path('handlers','endpoints/graph/queries/create/createRole.json')
},
{
	name: "update",
	query: global.SixCRM.routes.path('handlers','endpoints/graph/queries/update/updateRole.json')
},
{
	name: "delete",
	query: global.SixCRM.routes.path('handlers','endpoints/graph/queries/delete/deleteRole.json')
}];

let this_request = request(endpoint);

describe('Graph '+entity+' Test', function() {

	global.test_accounts.forEach((test_account) => {

		global.test_users.forEach((test_user) => {

			describe('Test the graph '+entity+' endpoint using "'+test_user.name+'" credentials on the account "'+test_account.name+'"', function() {

				let test_jwt = tu.createTestAuth0JWT(test_user.email, global.SixCRM.configuration.site_config.jwt.site.secret_key);

				tests.forEach((test) => {

					//let account = tu.getAccount(test.query);
					let account = test_account.id;

					it('Should return only '+test_user.name+' fields for '+entity+' '+test.name+'.', function (done) {
						var query = tu.getQuery(test.query);

						this_request.post('graph/'+account)
							.set('Authorization', test_jwt)
							.send(query)
							.expect(200)
							.expect('Content-Type', 'application/json')
							.expect('Access-Control-Allow-Origin','*')
							.expect('Access-Control-Allow-Methods', 'OPTIONS,POST')
							.expect('Access-Control-Allow-Headers','Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token')
							.end(function(err, response){
								tu.assertResultSetAsync(response, test_user.role,test.name, done);
							});
					});
				});

			});

		});

	});

	it('Test role index endpoint should return account-bound roles', done => {
		let account = global.test_accounts[1];
		let test_user = global.test_users[1];
		let test_jwt = tu.createTestAuth0JWT(test_user.email, global.SixCRM.configuration.site_config.jwt.site.secret_key);

		let query = 'query { rolelist(pagination:{limit: \"10\"}) { roles { id } } }';

		this_request.post('graph/'+account.id)
			.set('Authorization', test_jwt)
			.send(query)
			.expect(200)
			.end((error, response) => {
				assert.notInclude(response.body.response.data.rolelist.roles, { id: "e09ac44b-6cde-4572-8162-609f6f0aeca8" });
				done();
			});
	});

	it('Test role view endpoint should return only account-bound roles', done => {
		let account = global.test_accounts[1];
		let test_user = global.test_users[1];
		let test_jwt = tu.createTestAuth0JWT(test_user.email, global.SixCRM.configuration.site_config.jwt.site.secret_key);

		let query = 'query { role(id: "e09ac44b-6cde-4572-8162-609f6f0aeca8") { id } }';

		this_request.post('graph/'+account.id)
			.set('Authorization', test_jwt)
			.send(query)
			.expect(200)
			.end((error, response) => {
				assert.isNull(response.body.response.data.role);
				done();
			});
	});

});
