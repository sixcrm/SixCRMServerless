
const request = require('supertest');
const chai = require('chai');

let endpoint = global.integration_test_config.endpoint;
let this_request = request(endpoint);

describe('Public Tracker View Test', function() {
	describe('Test the public endpoint ('+endpoint+') using for tracker/view availability.', function() {
		it('Should return a 200 and some HTML', function (done) {
			this_request.get('publichtml/eyJjbGFzcyI6IlRyYWNrZXIiLCJtZXRob2QiOiJ2aWV3IiwidHJhY2tlciI6eyJpZCI6IjYyOTQ5NjYyLWVkZDYtNDc1MC05MjgwLTJkNDBjMjI1ZWI4MCJ9fQ==')
				.expect(200)
				.expect('Content-Type', 'application/json')
				.expect('Access-Control-Allow-Origin','*')
				.expect('Access-Control-Allow-Methods', 'OPTIONS,POST')
				.expect('Access-Control-Allow-Headers','Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token')
				.end(function(err, response){
					console.log(response);
					done();
				});
		});
	});
});
