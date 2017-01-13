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
			"session_id":"49a8492a-3919-4ae1-840a-23e2e6fad109",
			"products":["4d3419f6-526b-4a68-9050-fc3ffcb552b4"],
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
			.set('Authorization', global.test_jwt)
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
				var parsed_results;
				try{
					parsed_results = querystring.parse(response.body.results);
				}catch(e){
					assert.equal(e, null);
				}
				
				assert.property(parsed_results, "response");
				assert.equal(parsed_results.response, '1');
				assert.property(parsed_results, "responsetext");
				assert.equal(parsed_results.responsetext, 'SUCCESS');
				assert.property(parsed_results, 'authcode');
				assert.isString(parsed_results.authcode);
				expect(parsed_results.authcode).to.not.be.empty;
				assert.property(parsed_results, 'transactionid');
				assert.isString(parsed_results.transactionid);
				expect(parsed_results.transactionid).to.not.be.empty;
				assert.property(parsed_results,'type');
				assert.equal(parsed_results.type, 'sale');
				assert.property(parsed_results,'response_code');
				assert.equal(parsed_results.response_code, '100');				
					  
				done();
			}, done);
		
		});
	});
});