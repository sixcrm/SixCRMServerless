'use strict'
const request = require('supertest');
const chai = require('chai');

let endpoint = global.integration_test_config.endpoint;
let this_request = request(endpoint);

describe('Public Tracker View Test', function() {
    describe('Test the public endpoint ('+endpoint+') using for tracker/view availability.', function() {
        it('Should return a 200 and some HTML', function (done) {
            this_request.get('public/tracker/view/62949662-edd6-4750-9280-2d40c225eb80')
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
