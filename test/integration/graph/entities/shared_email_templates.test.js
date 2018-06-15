const request = require('supertest');
const chai = require('chai');
const tu = require('@sixcrm/sixcrmcore/util/test-utilities').default;

chai.use(require('chai-json-schema'));

const endpoint = global.integration_test_config.endpoint;
const entity = 'SharedEmailTemplates';
const tests = [{
	name: "index",
	query: global.SixCRM.routes.path('handlers','endpoints/graph/queries/index/getSharedEmailTemplates.json')
},
{
	name: "view",
	query: global.SixCRM.routes.path('handlers','endpoints/graph/queries/view/getSharedEmailTemplate.json')
}];

const this_request = request(endpoint);

describe('Graph '+entity+' Test', function() {
	global.test_accounts.forEach((test_account) => {
		global.test_users.forEach((test_user) => {
			describe('Test the graph '+entity+' endpoint using "'+test_user.name+'" credentials on the account "'+test_account.name+'"', function() {
				const test_jwt = tu.createTestAuth0JWT(test_user.email, global.SixCRM.configuration.site_config.jwt.site.secret_key);

				tests.forEach((test) => {
					const account = test_account.id;

					it('Should return only '+test_user.name+' fields for '+entity+' '+test.name+'.', function (done) {
						const query = tu.getQuery(test.query);

						this_request.post('graph/'+account)
							.set('Authorization', test_jwt)
							.send(query)
							.expect(200)
							.expect('Content-Type', 'application/json')
							.expect('Access-Control-Allow-Origin','*')
							.expect('Access-Control-Allow-Methods', 'OPTIONS,POST')
							.expect('Access-Control-Allow-Headers','Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token')
							.end(function(err, response){
								tu.assertResultSetAsync(response, test_user.role, test.name, done);
							});
					});
				});
			});
		});
	});
});
