var request = require('supertest');
var chai = require('chai');
chai.use(require('chai-json-schema'));
var assert = require('chai').assert;
var expect = require('chai').expect;
var fs = require('fs');
var yaml = require('js-yaml');
var querystring = require('querystring');

try {
  var config = yaml.safeLoad(fs.readFileSync('./test/integration/config/'+environment+'.yml', 'utf8'));
} catch (e) {
  console.log(e);
}

var endpoint = config.endpoint;

describe('Order Create Integration Test', function() {
  describe('Happy Path', function() {
    it('should create a order', function (done) {
		var this_request = request(endpoint);
		var post_body = {
			"session_id":"668ad918-0d09-4116-a6fe-0e8a9eda36f7",
			"campaign_id":"70a6689a-5814-438b-b9fd-dd484d0812f9",
			"products":["be992cea-e4be-4d3e-9afa-8e020340ed16"],
			"type":"sale",
			"ccnumber":"4111111111111111",
			"ccexpiration":"1025",
			"ccccv":"999",
			"name":"Rama Damunaste",
			"address":{
				"line1":"10 Skid Rw.",
				"line2":"Suite 100",
				"city":"Portland",
				"state":"Oregon",
				"zip":"97213",
				"country":"USA"
			}
		};
		
		this_request.post('order/create/')
			.send(post_body)
			.set('Content-Type', 'application/json')
			.set('Authorization', global.transaction_jwt)
			.expect(200)
			.expect('Content-Type', 'application/json')
			.expect('Access-Control-Allow-Origin','*')
			.expect('Access-Control-Allow-Methods', 'OPTIONS,POST')
			.expect('Access-Control-Allow-Headers','Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token')
			.end(function(err, response){
				assert.isObject(response.body);
				assert.property(response.body, "message");
				assert.equal(response.body.message, "Success");
				assert.property(response.body, "results");
				
				var processor_response = JSON.parse(response.body.results.processor_response);
				assert.property(processor_response.results, "response");
				assert.equal(processor_response.results.response, '1');
				assert.property(processor_response.results, "responsetext");
				assert.equal(processor_response.results.responsetext, 'SUCCESS');
				assert.property(processor_response.results, 'authcode');
				assert.isString(processor_response.results.authcode);
				expect(processor_response.results.authcode).to.not.be.empty;
				assert.property(processor_response.results, 'transactionid');
				assert.isString(processor_response.results.transactionid);
				expect(processor_response.results.transactionid).to.not.be.empty;
				assert.property(processor_response.results,'type');
				assert.equal(processor_response.results.type, 'sale');
				assert.property(processor_response.results,'response_code');
				assert.equal(processor_response.results.response_code, '100');				
					  
				done();
			}, done);
		
		});
	});
});