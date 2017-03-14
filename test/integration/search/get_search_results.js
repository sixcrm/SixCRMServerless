const request = require('supertest');
const chai = require('chai');
const assert = require('chai').assert
const fs = require('fs');
const yaml = require('js-yaml');
const tu = require('../../../lib/test-utilities.js');
const du = require('../../../lib/debug-utilities.js');

chai.use(require('chai-json-schema'));

let endpoint = global.integration_test_config.endpoint;

let entity = 'Simple';
let tests = [{
	name: "Simple Search",
	event: "./endpoints/search/events/getSearchResults"
}];

let test_users = [
	{
		name: 'Super User',
		email: 'super.user@test.com'
	}
];

du.output(endpoint);

let this_request = request(endpoint);
let account = '*';

describe(entity+' Search Test', function() {	
  		
	test_users.forEach((test_user) => {
		
		describe('Test the search endpoint using "'+test_user.name+'" credentials.', function() {  
		
			var test_jwt = tu.createTestAuth0JWT(test_user.email, global.site_config.jwt.auth0.secret_key);
			
			du.output(test_jwt);
			
			tests.forEach((test) => {
				
				it('Should return only '+test_user.name+' fields for '+entity+' '+test.name+'.', function (done) {
				
					var search_parameters = tu.getSearchParameters(test.event);
					du.output('Search Parameters', search_parameters);
					
					this_request.post('search/'+account)
						.set('Authorization', test_jwt)
						.send(search_parameters)
						.expect(200)
						.expect('Content-Type', 'application/json')
						.expect('Access-Control-Allow-Origin','*')
						.expect('Access-Control-Allow-Methods', 'OPTIONS,POST')
						.expect('Access-Control-Allow-Headers','Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token')
						.end(function(err, response){
							du.output(response.body);
							assert.isObject(response.body.hits);
							du.output(response.body.data);
							done();
						});
						
				});
				
			});
			
		});

	});	
	
});