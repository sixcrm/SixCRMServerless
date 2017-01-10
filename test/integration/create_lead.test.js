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

var customer_schema;

try{
	customer_schema = JSON.parse(fs.readFileSync('./model/customer.json','utf8'));
	address_schema = JSON.parse(fs.readFileSync('./model/address.json','utf8'));
} catch(e){
	console.log(e);
}

var endpoint = config.endpoint;

describe('Create Lead Integration Test', function() {
  describe('Happy Path', function() {
    it('should create a lead', function (done) {
		var this_request = request(endpoint);
		var post_body = {
			"firstname":"Rama",
			"lastname":"Damunaste",
			"email":"rama@damunaste.com",
			"phone":"1234567890",
			"billing":{
				"line1":"10 Downing St.",
				"city":"Detroit",
				"state":"Michigan",
				"zip":"12345",
				"country":"US"
			},
			"shipping":{
				"line1":"334 Lombard St.",
				"line2":"Apartment 2",
				"city":"Portland",
				"state":"Oregon",
				"zip":"97203",
				"country":"US"
			}
		};
		
		this_request.post('lead/create/')
			.send(post_body)
			.set('Content-Type', 'application/json')
			.set('Authorization', global.test_jwt)
			.expect(200)
			.expect('Content-Type', 'application/json')
			.expect('Access-Control-Allow-Origin','*')
			.expect('Access-Control-Allow-Methods', 'OPTIONS,POST')
			.expect('Access-Control-Allow-Headers','Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token')
			.end(function(err, response){
				assert.property(response.body, "message");
				assert.equal(response.body.message, "Success");
				assert.property(response.body, "results");
				assert.property(response.body.results, "transaction_id");
				assert.property(response.body.results, "customer");
				assert.isString(response.body.results.transaction_id);
				assert.isObject(response.body.results.customer);
				
				//expect(response.body.results.customer).to.be.jsonSchema(customer_schema);
				//expect(response.body.results.customer.billing).to.be.jsonSchema(address_schema);
				//expect(response.body.results.customer.shipping).to.be.jsonSchema(address_schema);
					  
				done();
			}, done);
		
		});
	});
});