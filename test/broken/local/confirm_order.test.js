var request = require('supertest');
var chai = require('chai');
chai.use(require('chai-json-schema'));
var assert = require('chai').assert;
var fs = require('fs');
var querystring = require('querystring');

try {
  var config = yaml.safeLoad(fs.readFileSync('./test/integration/config/'+environment+'.yml', 'utf8'));
} catch (e) {
  console.log(e);
}

var endpoint = config.endpoint;

describe('Confirm Order Integration Test', function() {
  describe('Happy Path', function() {
    it('should confirm a order', function (done) {
		var this_request = request(endpoint);
		var session_id = "668ad918-0d09-4116-a6fe-0e8a9eda36f7";
		this_request.get('order/confirm/')
			.query('session_id='+session_id)
			.set('Content-Type', 'application/json')
			.set('Authorization', global.transaction_jwt)
			.expect(200)
			.expect('Content-Type', 'application/json')
			.expect('Access-Control-Allow-Origin','*')
			.expect('Access-Control-Allow-Methods', 'OPTIONS,POST')
			.expect('Access-Control-Allow-Headers','Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token')
			.end(function(err, response){
				console.log(response.body);
				assert.isObject(response.body);
				assert.property(response.body, "message");
				assert.equal(response.body.message, "Success");
				done();
			}, done);
		
		});
	});
});