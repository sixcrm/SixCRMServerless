var request = require('supertest');
var chai = require('chai');
chai.use(require('chai-json-schema'));
var assert = require('chai').assert
var fs = require('fs');
var yaml = require('js-yaml');
var crypto = require('crypto');

var tu = require('../../../lib/test-utilities.js');

try {
  var config = yaml.safeLoad(fs.readFileSync('./test/integration/config/'+environment+'.yml', 'utf8'));
} catch (e) {
  console.log(e);
}

var endpoint = config.endpoint;

var entity = 'Access Keys';
var tests = [{
	name: "index",
	query: "./endpoints/graph/queries/index/getAccessKeys"
},
{
	name: "view",
	query: "./endpoints/graph/queries/view/getAccessKey"
},
{
	name: "create",
	query: "./endpoints/graph/queries/create/createAccessKey"
},
{
	name: "update",
	query: "./endpoints/graph/queries/update/updateAccessKey"
},
{
	name: "delete",
	query: "./endpoints/graph/queries/delete/deleteAccessKey"
}];

describe('Graph Test', function() {
  describe('Let\'s test the graph '+entity+' endpoint!', function() {
  	tests.forEach((test) => {
		it(entity+' '+test.name+' JSON results', function (done) {
			var query = tu.getQuery(test.query);
			var this_request = request(endpoint);
			var account = tu.getAccount(test.query);
			//console.log('\tQuery endpoint: '+endpoint+'graph/'+account);
			//console.log();
			this_request.post('graph/'+account)
				.set('Authorization', global.site_jwt)
				//.set('Authorization', test_jwt)
				.send(query)
				.expect(200)
				.expect('Content-Type', 'application/json')
				.expect('Access-Control-Allow-Origin','*')
				.expect('Access-Control-Allow-Methods', 'OPTIONS,POST')
				.expect('Access-Control-Allow-Headers','Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token')
				.end(function(err, response){
					tu.assertResultSet(response);
					done();
				});
			});
		});
	});
});