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

describe('Create Lead Integration Test', function() {
  describe('Happy Path', function() {
    it('should create a lead', function (done) {
		var this_request = request(endpoint);
		var post_body = {
			"firstname":"Rama",
			"lastname":"Damunaste",
			"email":"rama@damunaste.com",
			"phone":"1234567890",
			"address":{
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
			.set('Authorization', global.transaction_jwt)
			.expect(200)
			.expect('Content-Type', 'application/json')
			.expect('Access-Control-Allow-Origin','*')
			.expect('Access-Control-Allow-Methods', 'OPTIONS,POST')
			.expect('Access-Control-Allow-Headers','Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token')
			.end(function(err, response){
				assert.property(response.body, "message");
				assert.equal(response.body.message, "Success");
				assert.property(response.body, "results");
				assert.property(response.body.results, "session");
				assert.property(response.body.results, "customer");
				assert.property(response.body.results.session, "id");
				assert.isString(response.body.results.session.id);
				assert.isObject(response.body.results.customer);
				
				//more testing...
					  
				done();
			}, done);
		
		});
	});
});