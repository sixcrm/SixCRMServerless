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

var entity = 'Merchant Providers';
var tests = [{
	name: "index",
	query: "./endpoints/graph/queries/index/getMerchantProviders"
},
{
	name: "view",
	query: "./endpoints/graph/queries/view/getMerchantProvider"
},
{
	name: "create",
	query: "./endpoints/graph/queries/create/createMerchantProvider"
},
{
	name: "update",
	query: "./endpoints/graph/queries/update/updateMerchantProvider"
},
{
	name: "delete",
	query: "./endpoints/graph/queries/delete/deleteMerchantProvider"
}];

describe('Graph Test', function() {
  describe('Let\'s test the graph endpoint!', function() {
  	tests.forEach((test) => {
		it(entity+' '+test.name+' JSON results', function (done) {
			var query = tu.getQuery(test.query);
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
					tu.assertResultSet(response);
					done();
				}, done);
			});
		});
	});
});