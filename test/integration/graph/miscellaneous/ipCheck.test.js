const request = require('supertest');
const chai = require('chai');
const assert = require('chai').assert;

const aws = require('aws-sdk');
const ec2 = new aws.ec2();

const tu = global.SixCRM.routes.include('lib','test-utilities.js');
const du = global.SixCRM.routes.include('lib','debug-utilities.js');

let endpoint = global.integration_test_config.endpoint;

let test = {
    name: "uncategorized",
    query: global.SixCRM.routes.path('handlers','endpoints/graph/queries/uncategorized/ipCheck.json')
};

let test_user = {
	name: 'Known User',
	email: 'super.user@test.com'
};

let this_request = request(endpoint);
let account = '*';

describe('IP Check Test', function() {

	var test_jwt = tu.createTestAuth0JWT(test_user.email, global.SixCRM.configuration.site_config.jwt.site.secret_key);

	it('Should return an IP address', function (done) {

		var query = tu.getQuery(test.query);

		this_request.post('graph/'+account)
					.set('Authorization', test_jwt)
					.send(query)
					.expect(200)
					.expect('Content-Type', 'application/json')
					.end(function(err, response){

			if (err) return done(err);

			du.output(response.body);
			const ipAddress = response.body.response.data.ipCheck.ipAddress;
			assert.isString(ipAddress);

			ec2.describeNatGateways({
				Filter: [
					{
						Name: "tag:Name",
						Values: ["public-lambda"]
					}
				]
			}, function(err, result) {

				if (err) return done(err);

				assert.equal(result.NatGateways.length, 0, "Zero or multiple NAT Gateways found for public-lambda");
				assert.equal(result.NatGateways[0].NatGatewayAddresses[0].PublicIp, ipAddress, "Outgoing IP Address does not match NAT Gateway");

			})

			done();

		});

	});

});
