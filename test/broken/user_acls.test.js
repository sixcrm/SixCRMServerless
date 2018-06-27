const request = require('supertest');
const chai = require('chai');
const fs = require('fs');
const tu = require('@6crm/sixcrmcore/util/test-utilities.js').default;

chai.use(require('chai-json-schema'));

let endpoint = global.integration_test_config.endpoint;

var entity = 'User ACLs';
var tests = [{
	name: "index",
	query: "./endpoints/graph/queries/index/getUserACLs.json"
},
{
	name: "view",
	query: "./endpoints/graph/queries/view/getUserACL.json"
},
{
	name: "create",
	query: "./endpoints/graph/queries/create/createUserACL.json"
},
{
	name: "update",
	query: "./endpoints/graph/queries/update/updateUserACL.json"
},
{
	name: "delete",
	query: "./endpoints/graph/queries/delete/deleteUserACL.json"
}];

let this_request = request(endpoint);

describe('Graph '+entity+' Test', function() {

  	global.test_accounts.forEach((test_account) => {

  		global.test_users.forEach((test_user) => {

			if(test_user.email !== 'super.user@test.com'){ return true; }

			describe('Test the graph '+entity+' endpoint using "'+test_user.name+'" credentials on the account "'+test_account.name+'"', function() {

				let test_jwt = tu.createTestAuth0JWT(test_user.email, global.SixCRM.configuration.site_config.jwt.auth0.secret_key);

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
								tu.assertResultSet(response, test_user.role);
								done();
							});
					});
				});

			});

		});

	});

});
