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
		var query = '{ session(id: "dea70ef3-ef3d-4b48-94bd-192dd98f1331"){ id, customer { id, firstname, lastname }, created, modified, completed, products { id, name } } }';
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
				console.log(response.body.data.session);
				done();
			}, done);
		});
	});		
});