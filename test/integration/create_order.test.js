var request = require('supertest');
var chai = require('chai');
chai.use(require('chai-json-schema'));
var assert = require('chai').assert
var fs = require('fs');
var yaml = require('js-yaml');

try {
  var config = yaml.safeLoad(fs.readFileSync('./test/integration/config/'+environment+'.yml', 'utf8'));
} catch (e) {
  console.log(e);
}

var endpoint = config.endpoint;

describe('Lead Create Integration Test', function() {
  describe('Happy Path', function() {
    it('should create a Lead', function (done) {
		var this_request = request(endpoint);
			
		this_request.post('lead/create/')
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
				done();
			}, done);
		
		});
	});
});