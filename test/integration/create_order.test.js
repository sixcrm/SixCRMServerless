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
			"type":"sale",
			"ccnumber":"4111111111111111",
			"ccexp":"1025",
			"ccv":"999",
			"amount":"20.00",
			"currency":"USD",
			"payment":"creditcard",
			"ipaddress":"123.123.123.123",
			"firstname":"Rama",
			"lastname":"Damunaste",
			"company":"Damunaste Yoga",
			"address1":"123 Lombard St.",
			"address2":"Floor 2",
			"city":"Portland",
			"state":"OR",
			"zip":"97203",
			"country":"US",
			"phone":"1234567890",
			"email":"rama@damunaste.org",
			"shipping_firstname":"Rama",
			"shipping_lastname":"Damunaste",
			"shipping_company":"Damunaste Yoga",
			"shipping_address1":"123 Lombard St.",
			"shipping_address2":"Floor 2",
			"shipping_city":"Portland",
			"shipping_state":"OR",
			"shipping_zip":"97203",
			"shipping_country":"US",
			"shipping_phone":"1234567890",
			"shipping_email":"rama@damunaste.org"
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