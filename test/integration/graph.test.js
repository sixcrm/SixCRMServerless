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

describe('Graph Test', function() {
  describe('Let\'s test the graph endpoint!', function() {
    it('Should return some query results in JSON', function (done) {
		var query = '{ session(id: "668ad918-0d09-4116-a6fe-0e8a9eda36f7"){ id } }';
		var this_request = request(endpoint);
    	this_request.post('graph/')
			.set('Authorization', global.site_jwt)
			.send(query)
			.expect(200)
			.expect('Content-Type', 'application/json')
			.expect('Access-Control-Allow-Origin','*')
			.expect('Access-Control-Allow-Methods', 'OPTIONS,POST')
			.expect('Access-Control-Allow-Headers','Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token')
			.end(function(err, response){
				assert.isObject(response.body);
				assert.property(response.body, 'data');
				assert.isObject(response.body.data);
				done();
			}, done);
		});
	});		
});