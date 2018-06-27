

let chai = require('chai');
const querystring = require('querystring');

const expect = chai.expect;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;

const EndpointController = global.SixCRM.routes.include('controllers', 'endpoints/components/endpoint.js');

function getValidLambdaPOSTEvent(){

	return {
		resource: '/token/acquire/{account}',
		path: '/token/acquire/d3fa3bf3-7824-49f4-8261-87674482bf1c',
		httpMethod: 'POST',
		headers: {
			'Accept-Encoding': 'gzip, deflate',
			Authorization: '1ud98uhc9h989811ud01yd81u2d1289duu1du1a0d9uula:1510882985745:022eaf08f2d19bb0b198b34c5d0721d9ecb8a274',
			'CloudFront-Forwarded-Proto': 'https',
			'CloudFront-Is-Desktop-Viewer': 'true',
			'CloudFront-Is-Mobile-Viewer': 'false',
			'CloudFront-Is-SmartTV-Viewer': 'false',
			'CloudFront-Is-Tablet-Viewer': 'false',
			'CloudFront-Viewer-Country': 'US',
			'Content-Type': 'application/json',
			Host: 'development-api.sixcrm.com',
			'User-Agent': 'node-superagent/2.3.0',
			Via: '1.1 e1fff2dee56e3b55796cc594a92413c0.cloudfront.net (CloudFront)',
			'X-Amz-Cf-Id': 'auxn3Iv21qv3qMmcsVjlQxF86zRvidB4jV2XkHx3rdJ94iRatjLc_A==',
			'X-Amzn-Trace-Id': 'Root=1-5a0e3ea9-151c05ec1d5ebffe14d11acf',
			'X-Forwarded-For': '71.193.160.163, 52.46.16.55',
			'X-Forwarded-Port': '443',
			'X-Forwarded-Proto': 'https'
		},
		queryStringParameters: null,
		pathParameters: { account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c' },
		stageVariables: null,
		requestContext:{
			path: '/token/acquire/d3fa3bf3-7824-49f4-8261-87674482bf1c',
			accountId: '068070110666',
			resourceId: '7s02w8',
			stage: 'development',
			authorizer: {
				principalId: 'user',
				user: 'super.user@test.com'
			},
			requestId: 'a837419c-cb38-11e7-ad83-af785c8f6952',
			identity:{
				cognitoIdentityPoolId: null,
				accountId: null,
				cognitoIdentityId: null,
				caller: null,
				apiKey: '',
				sourceIp: '71.193.160.163',
				accessKey: null,
				cognitoAuthenticationType: null,
				cognitoAuthenticationProvider: null,
				userArn: null,
				userAgent: 'node-superagent/2.3.0',
				user: null
			},
			resourcePath: '/token/acquire/{account}',
			httpMethod: 'POST',
			apiId: '8jmwnwcaic'
		},
		body: '{"campaign":"70a6689a-5814-438b-b9fd-dd484d0812f9","affiliates":{"affiliate":"ZC9HCFCTGZ","subaffiliate_1":"MMCSENES99","subaffiliate_2":"7YR4T5345D","subaffiliate_3":"9H24CJCXEV","subaffiliate_4":"FGTLJ5NEJU","subaffiliate_5":"6Y2CRE5QN9","cid":"5JN5LHRVZR"}}',
		isBase64Encoded: false
	}

}

function getValidPOSTEvent(){

	return getValidLambdaPOSTEvent();

}

function getValidGETEvent(){

	return {
		resource: '/order/confirm/{account}',
		path: '/order/confirm/d3fa3bf3-7824-49f4-8261-87674482bf1c',
		httpMethod: 'GET',
		headers:{
			'Accept-Encoding': 'gzip, deflate',
			Authorization: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2RldmVsb3BtZW50LWFwaS5zaXhjcm0uY29tIiwic3ViIjoiIiwiYXVkIjoiIiwiaWF0IjoxNTEwOTQxNzc4LCJleHAiOjE1MTA5NDUzNzgsInVzZXJfYWxpYXMiOiI0ZWUyM2E4ZjVjODY2MTYxMjA3NWE4OWU3MmE1NmEzYzZkMDBkZjkwIn0.jfbPQSJwZv2skrTJySsMJmcNvt8coeyZVSEEUOaTt-Y',
			'CloudFront-Forwarded-Proto': 'https',
			'CloudFront-Is-Desktop-Viewer': 'true',
			'CloudFront-Is-Mobile-Viewer': 'false',
			'CloudFront-Is-SmartTV-Viewer': 'false',
			'CloudFront-Is-Tablet-Viewer': 'false',
			'CloudFront-Viewer-Country': 'US',
			'Content-Type': 'application/json',
			Host: 'development-api.sixcrm.com',
			'User-Agent': 'node-superagent/2.3.0',
			Via: '1.1 b790a9f06b09414fec5d8b87e81d4b7f.cloudfront.net (CloudFront)',
			'X-Amz-Cf-Id': 'JDUyLefXSBpKYynNMThD1sH4jzPcU9ndj-3MM5MOPKW10qX9Cmw5pQ==',
			'X-Amzn-Trace-Id': 'Root=1-5a0f245c-2fe94fc0549af2be1eb5a6c2',
			'X-Forwarded-For': '173.164.96.76, 54.182.214.62',
			'X-Forwarded-Port': '443',
			'X-Forwarded-Proto': 'https'
		},
		queryStringParameters: { session: 'c20d32b2-1cfe-4e0f-a02d-ca84114f1824' },
		pathParameters: { account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c' },
		stageVariables: null,
		requestContext:{
			path: '/order/confirm/d3fa3bf3-7824-49f4-8261-87674482bf1c',
			accountId: '068070110666',
			resourceId: 'ejrzhw',
			stage: 'development',
			authorizer:{
				principalId: 'user',
				user: '4ee23a8f5c8661612075a89e72a56a3c6d00df90'
			},
			requestId: '917f38cd-cbc1-11e7-9057-8d409e17b329',
			identity:{
				cognitoIdentityPoolId: null,
				accountId: null,
				cognitoIdentityId: null,
				caller: null,
				apiKey: '',
				sourceIp: '173.164.96.76',
				accessKey: null,
				cognitoAuthenticationType: null,
				cognitoAuthenticationProvider: null,
				userArn: null,
				userAgent: 'node-superagent/2.3.0',
				user: null
			},
			resourcePath: '/order/confirm/{account}',
			httpMethod: 'GET',
			apiId: '8jmwnwcaic'
		},
		body: null,
		isBase64Encoded: false
	};

}

describe('controllers/endpoints/endpoint.js', () => {

	describe('constructor', () => {
		it('successfully constructs', () => {
			let endpointController = new EndpointController();

			expect(objectutilities.getClassName(endpointController)).to.equal('EndpointController');
		});
	});

	describe('execute', () => {
		it('calls preamble', () => {
			let called = false;
			const event = {};
			const endpointController = new EndpointController();
			endpointController.preamble = _event => {
				expect(_event).to.equal(event)
				called = true;
				return Promise.resolve();
			}
			return endpointController.execute(event).then(() => {
				expect(called).to.be.true;
			});
		});

		it('calls body', () => {
			let called = false;
			const event = {};
			const endpointController = new EndpointController();
			endpointController.body = _event => {
				expect(_event).to.equal(event)
				called = true;
				return Promise.resolve();
			}
			return endpointController.execute(event).then(() => {
				expect(called).to.be.true;
			});
		});

		it('calls epilogue', () => {
			let called = false;
			const event = {};
			const endpointController = new EndpointController();
			endpointController.epilogue = () => {
				called = true;
				return Promise.resolve();
			}
			return endpointController.execute(event).then(() => {
				expect(called).to.be.true;
			});
		});

		it('returns body', () => {
			const response = 'foo';
			const event = {};
			const endpointController = new EndpointController();
			endpointController.body = () => {
				return Promise.resolve(response);
			}
			return endpointController.execute(event).then(result => {
				expect(result).to.equal(response);
			});
		});
	});

	describe('clearState', () => {
		it('successfully clears the state', () => {
			let endpointController = new EndpointController();

			endpointController.pathParameters = 'ack';
			endpointController.queryString = 'gack';
			endpointController.clearState();
			expect(endpointController.pathParameters).to.equal(undefined);
			expect(endpointController.queryString).to.equal(undefined);
		});
	});

	describe('acquireRequestProperties', () => {

		it('successfully acquires request properties', () => {

			let endpointController = new EndpointController();

			let event = getValidPOSTEvent();

			let result = endpointController.acquireRequestProperties(event);

			expect(result.account).to.deep.equal(event.pathParameters.account);
			expect(result.campaign).to.deep.equal(JSON.parse(event.body).campaign);
			expect(result.affiliates).to.deep.equal(JSON.parse(event.body).affiliates);

		});
	});

	describe('acquireBody', () => {

		it('successfully acquires a JSON string body', () => {

			let endpointController = new EndpointController();

			let event = getValidPOSTEvent();

			let result = endpointController.acquireBody(event)

			expect(result).to.deep.equal(JSON.parse(event.body));

		});

		it('successfully acquires a JSON object body', () => {

			let endpointController = new EndpointController();

			let event = getValidPOSTEvent();

			event.body = JSON.parse(event.body);

			let result = endpointController.acquireBody(event)

			expect(result).to.deep.equal(event.body);


		});

		it('throws an error when neither case resolves', () => {

			let endpointController = new EndpointController();

			let event = getValidPOSTEvent();

			event.body = 'blarg';

			let result = endpointController.acquireBody(event);

			expect(result).to.deep.equal({});

		});

		it('returns no data if event body is not a string', () => {

			let endpointController = new EndpointController();

			let event = getValidPOSTEvent();

			event.body = 123; //anything that is not a string

			let result = endpointController.acquireBody(event);

			expect(result).to.deep.equal({});

		});

		it('returns no data when there is no event body', () => {

			let endpointController = new EndpointController();

			let event = getValidPOSTEvent();

			delete event.body;

			let result = endpointController.acquireBody(event);

			expect(result).to.deep.equal({});

		});

	});

	describe('acquirePathParameters', () => {

		it('sets path parameters', () => {

			let event = getValidPOSTEvent();

			let endpointController = new EndpointController();

			let result = endpointController.acquirePathParameters(event);

			expect(result).to.deep.equal(event.pathParameters);

		});

		it('throws an error when event does not have pathParameters property.', () => {

			let event = getValidPOSTEvent();

			delete event.pathParameters;

			let endpointController = new EndpointController();

			endpointController.pathParameters = 'something';

			let result = endpointController.acquirePathParameters(event);

			expect(result).to.deep.equal({});

		});

	});

	describe('acquireQueryStringParameters', () => {

		it('acquires query string parameters', () => {

			let event = getValidPOSTEvent();

			event.queryStringParameters = {anyQueryString: 'aQueryString'};

			let endpointController = new EndpointController();

			let result = endpointController.acquireQueryStringParameters(event);

			expect(result).to.deep.equal(event.queryStringParameters);

		});

		it('returns parsed query string parameters', () => {

			let event = getValidPOSTEvent();

			event.queryStringParameters = 'anyQueryString=aQueryString';

			let endpointController = new EndpointController();

			let result = endpointController.acquireQueryStringParameters(event);

			expect(result).to.deep.equal({anyQueryString: 'aQueryString'});

		});

		it('return empty object when query string parameters can\'t be acquired', () => {

			let event = getValidPOSTEvent();

			delete event.queryStringParameters;

			let endpointController = new EndpointController();

			let result = endpointController.acquireQueryStringParameters(event);

			expect(result).to.deep.equal({});

		});

	});

	describe('normalize event', () => {

		it('successfully normalizes events', () => {

			let test_case = {
				lambda:getValidLambdaPOSTEvent(),
				local:getValidPOSTEvent()
			}

			let endpointController = new EndpointController();
			let lambda;
			let local;

			return endpointController.normalizeEvent(test_case.lambda).then(result => { lambda = result; })
				.then(() => endpointController.normalizeEvent(test_case.local)).then(result => { local = result; })
				.then(() => {
					expect(local).to.deep.equal(lambda);
				});

		});

	});

	describe('validateEvent', () => {

		it('validates a good event', () => {

			let event = getValidPOSTEvent();
			let endpointController = new EndpointController();

			return endpointController.validateEvent(event).then(result => {
				expect(result).to.deep.equal(event);
			});

		});

		it('validates a good event', () => {

			let event = getValidGETEvent();
			let endpointController = new EndpointController();

			return endpointController.validateEvent(event).then(result => {
				expect(result).to.deep.equal(event);
			});

		});

		it('throws error when path parameter is missing', () => {

			let event = getValidPOSTEvent();

			delete event.pathParameters;

			let endpointController = new EndpointController();

			try{
				endpointController.validateEvent(event);
			}catch(error){
				expect(error.message).to.equal('[400] Unexpected event structure.');
			}

		});

		it('throws error when path parameter is incorrect type', () => {

			let endpointController = new EndpointController();
			let bad_types = [123, null, () => {}, 3.2];

			arrayutilities.map(bad_types, bad_type => {

				let event = getValidPOSTEvent();

				event.pathParameters = bad_type;

				try{
					endpointController.validateEvent(event);
				}catch(error){
					expect(error.message).to.equal('[400] Unexpected event structure.');
				}

			});

		});

		it('throws error when requestContext is missing', () => {

			let event = getValidPOSTEvent();

			delete event.requestContext;

			let endpointController = new EndpointController();

			try{
				endpointController.validateEvent(event);
			}catch(error){
				expect(error.message).to.equal('[400] Unexpected event structure.');
			}

		});

		it('throws error when requestContext is incorrect type', () => {

			let endpointController = new EndpointController();
			let bad_types = [123, null, () => {}, 3.2];

			arrayutilities.map(bad_types, bad_type => {

				let event = getValidPOSTEvent();

				event.requestContext = bad_type;

				try{
					endpointController.validateEvent(event);
				}catch(error){
					expect(error.message).to.equal('[400] Unexpected event structure.');
				}

			});

		});

	});

	describe('parseEventQueryString', () => {

		it('successfully parses encoded querystring parameters', () => {

			let endpointController = new EndpointController();
			let event = getValidGETEvent();

			event.queryStringParameters = querystring.stringify(event.queryStringParameters);
			let parsed_querystring = querystring.parse(event.queryStringParameters);

			return endpointController.parseEventQueryString(event).then(result => {

				expect(result.queryStringParameters).to.deep.equal(parsed_querystring);

			});

		});

		it('successfully returns when queryStringParameters is a object', () => {

			let endpointController = new EndpointController();
			let event = getValidGETEvent();

			return endpointController.parseEventQueryString(event).then(result => {

				expect(result.queryStringParameters).to.deep.equal(event.queryStringParameters);

			});

		});

		it('successfully returns when queryStringParameters is not set', () => {

			let endpointController = new EndpointController();
			let event = getValidGETEvent();

			event.queryStringParameters = null;

			return endpointController.parseEventQueryString(event).then(result => {

				expect(result).to.deep.equal(event);

			});

		});

		it('throws an error when queryStringParameters is not parsable', () => {
			let endpointController = new EndpointController();
			let bad_types = [123, true, [], () => {}];

			return Promise.all(arrayutilities.map(bad_types, bad_type => {
				let event = getValidGETEvent();
				event.queryStringParameters = bad_type;

				return endpointController.parseEventQueryString(event)
					.then(() => {
						throw new Error(`Expected failure for ${bad_type}`);
					})
					.catch(error => {
						expect(error.message).to.equal('[400] Unexpected event structure.');
					});

			}));

		});

	});

	describe('throwUnexpectedEventStructureError', () => {
		it('successfully throws an error', () => {
			let endpointController = new EndpointController();

			try{
				endpointController.throwUnexpectedEventStructureError();
			}catch(error){
				expect(error.message).to.equal('[400] Unexpected event structure.');
			}
		});
	});

});
