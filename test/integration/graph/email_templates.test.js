const request = require('supertest');
const chai = require('chai');
const assert = require('chai').assert
const fs = require('fs');
const yaml = require('js-yaml');
const tu = require('../../../lib/test-utilities.js');

chai.use(require('chai-json-schema'));

let endpoint = global.integration_test_config.endpoint;

var entity = 'EmailTemplates';
var tests = [{
	name: "index",
	query: "./endpoints/graph/queries/index/getEmailTemplates"
},
{
	name: "view",
	query: "./endpoints/graph/queries/view/getEmailTemplate"
},
{
	name: "create",
	query: "./endpoints/graph/queries/create/createEmailTemplate"
},
{
	name: "update",
	query: "./endpoints/graph/queries/update/updateEmailTemplate"
},
{
	name: "delete",
	query: "./endpoints/graph/queries/delete/deleteEmailTemplate"
}];

let this_request = request(endpoint);

describe('Graph '+entity+' Test', function() {	
  		
  	global.test_accounts.forEach((test_account) => {
  		
  		global.test_users.forEach((test_user) => {
			
			describe('Test the graph '+entity+' endpoint using "'+test_user.name+'" credentials on the account "'+test_account.name+'"', function() {  
			
				let test_jwt = tu.createTestAuth0JWT(test_user.email, global.site_config.jwt.auth0.secret_key);
			
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