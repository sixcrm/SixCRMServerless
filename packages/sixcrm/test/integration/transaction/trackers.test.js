const request = require('supertest');
const chai = require('chai');

chai.use(require('chai-json-schema'));
const assert = require('chai').assert

const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const tu = require('@6crm/sixcrmcore/lib/util/test-utilities').default;
const signatureutilities = require('@6crm/sixcrmcore/lib/util/signature').default;
const timestamp = require('@6crm/sixcrmcore/lib/util/timestamp').default;

try {
	var config = global.SixCRM.routes.include('test', '/integration/config/'+process.env.stage+'.yml');
} catch (e) {
	du.warning(e);
}

function getValidAcquireTokenPostBody(){

	return {
		'campaign':'70a6689a-5814-438b-b9fd-dd484d0812f9'
	};

}

function getValidTrackerPostBody(){

	return {
		campaign:'70a6689a-5814-438b-b9fd-dd484d0812f9',
		affiliate_id:'whatever'
	};

}

function getValidAuthorizationString(){

	let secret_key = config.access_keys.super_user.secret_key;
	let access_key = config.access_keys.super_user.access_key;
	let request_time = timestamp.createTimestampMilliseconds();

	let signature = signatureutilities.createSignature(secret_key, request_time);

	return access_key+':'+request_time+':'+signature;

}

var endpoint = config.endpoint;
var appropriate_spacing = '        ';

describe('Tracking Test', () => {
	it('Returns trackers that match POSTed parameters', (done) => {

		let account = config.account;

		let authorization_string = getValidAuthorizationString();

		//du.info('Authorization String: ', authorization_string);
		du.info(appropriate_spacing+'Acquiring Token');

		let post_body = getValidAcquireTokenPostBody();
		//du.debug('Post data', post_body);

		du.warning('token/acquire/'+account, authorization_string, post_body);

		request(endpoint).post('token/acquire/'+account)
			.send(post_body)
			.set('Content-Type', 'application/json')
			.set('Authorization', authorization_string)
			.expect(200)
			.expect('Content-Type', 'application/json')
			.expect('Access-Control-Allow-Origin','*')
			.expect('Access-Control-Allow-Methods', 'OPTIONS,POST')
			.expect('Access-Control-Allow-Headers','Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token')
			.end((err, response) => {

				du.debug(response.body);
				tu.assertSuccessfulResponse(response.body, 'graph');
				var jwt = response.body.response;

				du.debug('Acquired JWT:', jwt);

				du.info(appropriate_spacing+'Acquiring Trackers');
				post_body = getValidTrackerPostBody();

				request(endpoint).post('tracking/'+account)
					.send(post_body)
					.set('Content-Type', 'application/json')
					.set('Authorization', jwt)
					.expect(200)
					.expect('Content-Type', 'application/json')
					.expect('Access-Control-Allow-Origin','*')
					.expect('Access-Control-Allow-Methods', 'OPTIONS,POST')
					.expect('Access-Control-Allow-Headers','Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token')
					.end((err, response) => {

						du.debug('Tracking Response', response.body);
						assert.property(response.body.response, "trackers");
						done();

					});

			});

	});

});
