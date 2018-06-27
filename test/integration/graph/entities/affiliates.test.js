const request = require('supertest');
const chai = require('chai');

const tu = require('@6crm/sixcrmcore/util/test-utilities').default;
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;


chai.use(require('chai-json-schema'));

let endpoint = global.integration_test_config.endpoint;

var entity = 'Affiliates';
var tests = [{
	name: "index",
	query: global.SixCRM.routes.path('handlers','endpoints/graph/queries/index/getAffiliates.json')
},
{
	name: "view",
	query: global.SixCRM.routes.path('handlers','endpoints/graph/queries/view/getAffiliate.json')
},
{
	name: "create",
	query: global.SixCRM.routes.path('handlers','endpoints/graph/queries/create/createAffiliate.json')
},
{
	name: "update",
	query: global.SixCRM.routes.path('handlers','endpoints/graph/queries/update/updateAffiliate.json')
},
{
	name: "delete",
	query: global.SixCRM.routes.path('handlers','endpoints/graph/queries/delete/deleteAffiliate.json')
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

						/*
                du.info(
                  'Account: '+account,
                  'JWT: '+test_jwt,
                  'query: '+query
                );
                */



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
