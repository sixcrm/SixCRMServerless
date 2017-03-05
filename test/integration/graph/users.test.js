const request = require('supertest');
const chai = require('chai');
const assert = require('chai').assert
const fs = require('fs');
const yaml = require('js-yaml');
const tu = require('../../../lib/test-utilities.js');

chai.use(require('chai-json-schema'));

let endpoint = global.integration_test_config.endpoint;

var entity = 'Users';
var tests = [{
	name: "index",
	query: "./endpoints/graph/queries/index/getUsers"
},
{
	name: "view",
	query: "./endpoints/graph/queries/view/getUser"
},
{
	name: "create",
	query: "./endpoints/graph/queries/create/createUser"
},
{
	name: "update",
	query: "./endpoints/graph/queries/update/updateUser"
},
{
	name: "delete",
	query: "./endpoints/graph/queries/delete/deleteUser"
},
{
	name: "byemail",
	query: "./endpoints/graph/queries/view/getUserByEmail"
}];

let this_request = request(endpoint);

describe('Graph '+entity+' Test', function() {	
  		
  	global.test_accounts.forEach((test_account) => {
			
		describe('Test the graph '+entity+' endpoint using '+test_account.name+' credentials', function() {  
			
			let test_jwt = tu.createTestAuth0JWT(test_account.email, global.site_config.jwt.auth0.secret_key);
			
			tests.forEach((test) => {
	
				let account = tu.getAccount(test.query);
		
				it('Should return only '+test_account.name+' fields for '+entity+' '+test.name+'.', function (done) {
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
							tu.assertResultSet(response, test_account.role);
							done();
						});
				});
			});
		  		
  		});

	});	
	
});