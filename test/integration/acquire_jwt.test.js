var request = require('supertest');
var chai = require('chai');
chai.use(require('chai-json-schema'));
var assert = require('chai').assert
var fs = require('fs');
var yaml = require('js-yaml');
var crypto = require('crypto');

try {
  var config = yaml.safeLoad(fs.readFileSync('./test/integration/config/'+environment+'.yml', 'utf8'));
} catch (e) {
  console.log(e);
}

var endpoint = config.endpoint;

describe('JWT Acquisition Integration Test', function() {
  describe('Acquire JWT', function() {
    it('should acquire a JWT', function (done) {
    	
    	var request_time = new Date().getTime();
		var signature = crypto.createHash('sha1').update(config.secret_key+request_time).digest('hex');
    	var authorization_string = config.access_key+':'+request_time+':'+signature;

		request = request(endpoint);
    	request.get('token/acquire/')
			.set('Content-Type', 'application/json')
			.set('Authorization', authorization_string)
			.expect(200)
			.expect('Content-Type', 'application/json')
			.expect('Access-Control-Allow-Origin','*')
			.expect('Access-Control-Allow-Methods', 'OPTIONS,POST')
			.expect('Access-Control-Allow-Headers','Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token')
			.end(function(err, response){
				assert.isObject(response.body);
				assert.property(response.body, "message");
				assert.equal(response.body.message, "Success");
				assert.property(response.body, "token");
				assert.isString(response.body.token);
				done();
			}, done);
		});
	});
});