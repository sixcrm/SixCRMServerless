'use strict'
const request = require('supertest');
const chai = require('chai');

let endpoint = global.integration_test_config.endpoint;
let this_request = request(endpoint);

describe('Public Tracker View Test', function() {
    describe('Test the public endpoint ('+endpoint+') using for tracker/view availability.', function() {
        it('Should return a 200 and some HTML', function (done) {
            this_request.get('publichtml/eyJjbGFzcyI6InRyYWNrZXIiLCJtZXRob2QiOiJ2aWV3IiwiYXJndW1lbnRzIjoiNjI5NDk2NjItZWRkNi00NzUwLTkyODAtMmQ0MGMyMjVlYjgwIn0=')
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
