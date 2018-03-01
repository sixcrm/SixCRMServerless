var request = require('supertest');
var chai = require('chai');
chai.use(require('chai-json-schema'));
var assert = require('chai').assert;
var expect = require('chai').expect;
chai.use(require('../../../unit/chaiAssertionHelper'));
require('require-yaml');

var config = require('../../config/'+process.env.stage);
var endpoint = config.endpoint;


describe('Order Create Integration Test', function() {
	//This test is not repeatable, due to productSchedules checking for existing ones.
	// Must restart dynamboDB local to re-seed..
  describe('Happy Path', function() {
    it('should create an order', function (done) {
			request(endpoint)
			.post('order/create/')
			.send(require('./fixtures/createOrder.json'))
			.set('Content-Type', 'application/json')
			.set('Authorization', config.jwt)
			.expect(200)
			.expect('Content-Type', 'application/json')
			.expect('Access-Control-Allow-Origin','*')
			.expect('Access-Control-Allow-Methods', 'OPTIONS,POST')
			.expect('Access-Control-Allow-Headers','Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token')
			.end(function(err, response){

				assert.isObject(response.body);
				assert.property(response.body, "results");

				scrubProperty(response.body.results, 'date');
				scrubProperty(response.body.results, 'id');
				scrubProperty(response.body.results, 'rebill_id');

				assert.property(response.body.results, 'processor_response');
				response.body.results.processor_response = JSON.parse(response.body.results.processor_response);
				scrubProperty(response.body.results.processor_response.results, 'transactionid')

				expect(response.body).to.deepEqualProcessor(__dirname, 'createOrder');
				done();
			}, done);

		});
	});
});
function scrubProperty(obj, prop) {
	assert.property(obj, prop);
	obj[prop] = 'scrubbed';
}
