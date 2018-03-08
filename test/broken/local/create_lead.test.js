const request = require('supertest');
const chai = require('chai');

chai.use(require('chai-json-schema'));
const assert = require('chai').assert;

var config = global.SixCRM.routes.include('test', '/integration/config/'+process.env.stage+'.yml');

var endpoint = config.endpoint;

describe('Create Lead Integration Test', function() {
  describe('Happy Path', function() {
    it('should create a lead', function (done) {
		var this_request = request(endpoint);
		var post_body = {
			"campaign_id":"70a6689a-5814-438b-b9fd-dd484d0812f9",
			"affiliate_id":"6b6331f6-7f84-437a-9ac6-093ba301e455",
			"firstname":"Rama",
			"lastname":"Damunaste",
			"email":"rama@damunaste.com",
			"phone":"1234567890",
			"address":{
				"line1":"334 Lombard St.",
				"line2":"Apartment 2",
				"city":"Portland",
				"state":"OR",
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