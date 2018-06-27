const request = require('supertest');
const chai = require('chai');
chai.use(require('chai-json-schema'));
const assert = require('chai').assert;

const fs = require('fs');
const crypto = require('crypto');

const timestamp = require('@6crm/sixcrmcore/util/timestamp').default;
const du =  require('@6crm/sixcrmcore/util/debug-utilities.js').default;
const tu =  require('@6crm/sixcrmcore/util/test-utilities.js').default;
const signature = require('@6crm/sixcrmcore/util/signature.js').default;

try {
	var config = global.SixCRM.configuration.site_config;
} catch (e) {
	console.log(e);
}

du.debug('Integration Config:', config);

var endpoint = config.endpoint;
du.debug('Endpoint:'+ endpoint);

describe('Site JWT Acquisition Integration Test', function() {
	describe('Happy Path', function() {
		it('should acquire a Site JWT', function (done) {

    	var request_time = timestamp.createTimestampMilliseconds();
			var this_signature = signature.createSignature(config.secret_key, request_time);

			du.debug('Signature: ', this_signature);

    	var authorization_string = config.access_key+':'+request_time+':'+this_signature;

    	du.debug('Authorization String: ', authorization_string);

			var this_request = request(endpoint);
    	this_request.get('token/acquire/')
				.set('Content-Type', 'application/json')
				.set('Authorization', authorization_string)
				.expect(200)
				.expect('Content-Type', 'application/json')
				.expect('Access-Control-Allow-Origin','*')
				.expect('Access-Control-Allow-Methods', 'OPTIONS,POST')
				.expect('Access-Control-Allow-Headers','Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token')
				.end(function(err, response){

					if(err){ du.warning(err); }

					du.info(response.body);

					assert.isObject(response.body);
					assert.property(response.body, "message");
					assert.equal(response.body.message, "Success");
					assert.property(response.body, "token");
					assert.isString(response.body.token);

				}, done);
		});

	/*
	describe('Broken Path(s)', function() {

		it('should fail signature validation due to bad signature', function (done) {

			var request_time = timestamp.createTimestampMilliseconds();
			var this_signature = signature.createSignature(config.secret_key, request_time)+'1';
			var authorization_string = config.access_key+':'+request_time+':'+this_signature;

			var this_request = request(endpoint);
			this_request.get('token/acquire/')
				.set('Content-Type', 'application/json')
				.set('Authorization', authorization_string)
				.expect(500)
				.expect('Content-Type', 'application/json')
				.end(function(err, response){
					assert.isObject(response.body);
					assert.property(response.body, "Message")
					assert.equal(response.body.Message, "User is not authorized to access this resource");
					done();
				}, done);
		});

		it('should fail signature validation due to bad access_key', function (done) {

			var request_time = timestamp.createTimestampMilliseconds();
			var this_signature = signature.createSignature(config.secret_key, request_time);
			var authorization_string = 'awdadwya8w0dau8dwuadjowja:'+request_time+':'+this_signature;

			var this_request = request(endpoint);
			this_request.get('token/acquire/')
				.set('Content-Type', 'application/json')
				.set('Authorization', authorization_string)
				.expect(500)
				.expect('Content-Type', 'application/json')
				.end(function(err, response){
					assert.isObject(response.body);
					assert.property(response.body, "Message");
					assert.equal(response.body.Message, "User is not authorized to access this resource");
					done();
				}, done);
		});

		it('should fail signature validation due to bad expired timestamp', function (done) {

			var request_time = 123;
			var this_signature = signature.createSignature(config.secret_key, request_time);
			var authorization_string = config.access_key+':'+request_time+':'+this_signature;

			var this_request = request(endpoint);
			this_request.get('token/acquire/')
				.set('Content-Type', 'application/json')
				.set('Authorization', authorization_string)
				.expect(500)
				.expect('Content-Type', 'application/json')
				.end(function(err, response){
					assert.isObject(response.body);
					assert.property(response.body, "Message");
					assert.equal(response.body.Message, "User is not authorized to access this resource");
					done();
				}, done);
		});

		it('should fail signature validation structure', function (done) {

			var request_time = timestamp.createTimestampMilliseconds();
			var this_signature = signature.createSignature(config.secret_key, request_time);
			var authorization_string = config.access_key+''+request_time+':'+this_signature;

			var this_request = request(endpoint);
			this_request.get('token/acquire/')
				.set('Content-Type', 'application/json')
				.set('Authorization', authorization_string)
				.expect(500)
				.expect('Content-Type', 'application/json')
				.end(function(err, response){
					assert.isObject(response.body);
					assert.property(response.body, "Message");
					assert.equal(response.body.Message, "User is not authorized to access this resource");
					done();
				}, done);
		});

		it('should fail due to missing headers', function (done) {

			var request_time = timestamp.createTimestampMilliseconds();
			var this_signature = signature.createSignature(config.secret_key, request_time);
			var authorization_string = config.access_key+''+request_time+':'+this_signature;

			var this_request = request(endpoint);
			this_request.get('token/acquire/')
				.expect(500)
				.expect('Content-Type', 'application/json')
				.end(function(err, response){
					assert.isObject(response.body);
					assert.property(response.body, "message");
					assert.equal(response.body.message, "Unauthorized");
					done();
				}, done);
		});
	*/
	});
});