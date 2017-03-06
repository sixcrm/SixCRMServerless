const request = require('supertest');
const chai = require('chai');
const assert = require('chai').assert
const fs = require('fs');
const yaml = require('js-yaml');
const tu = require('../../../lib/test-utilities.js');

chai.use(require('chai-json-schema'));

let endpoint = global.integration_test_config.endpoint;

var entity = 'SMTP Providers';
var tests = [{
	name: "index",
	query: "./endpoints/graph/queries/index/getSMTPProviders"
},
{
	name: "view",
	query: "./endpoints/graph/queries/view/getSMTPProvider"
},
{
	name: "create",
	query: "./endpoints/graph/queries/create/createSMTPProvider"
},
{
	name: "update",
	query: "./endpoints/graph/queries/update/updateSMTPProvider"
},
{
	name: "delete",
	query: "./endpoints/graph/queries/delete/deleteSMTPProvider"
}];

let this_request = request(endpoint);

describe('Graph '+entity+' Test', function() {	
  		
  	global.test_accounts.forEach((test_account) => {
  		
  		let account = test_account.id;
  		
  		global.test_users.forEach((test_user) => {
			
			describe('Test the graph '+entity+' endpoint using "'+test_user.name+'" credentials on the account "'+test_account.name+'".', function() {  
			
				let test_jwt = tu.createTestAuth0JWT(test_user.email, global.site_config.jwt.auth0.secret_key);
				
				it('Should return only '+test_user.name+' fields for '+entity+' endpoints', function (done) {
				
					let async_test = [];
				
					let callback = function(){ console.log('here!'); }
					
					tests.forEach((test) => {
		
						var query = tu.getQuery(test.query);
						
						let test_request = function(callback){
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
									callback();
								});
						}
						
						async_test.push(test_request);
						
					});
					
					async.series(async_test, done);
					
				});
				
			});
	
		});	
		
	});	
	
});