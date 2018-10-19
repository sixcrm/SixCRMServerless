const chai = require('chai');
const expect = chai.expect;
const mockery = require('mockery');

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

describe('controllers/endpoints/authenticated', () => {

	before(() => {
		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
	});

	afterEach(() => {
		mockery.resetCache();
	});

	after(() => {
		mockery.deregisterAll();
		mockery.disable();
	});

	describe('isUserIntrospection', () => {

		it('returns true when event body has valid user introspection structure', () => {

			let event = getValidGETEvent();

			//example body parameter with valid structure
			event.body = "{ userintrospection { id name alias first_name last_name auth0_id }}";

			const AuthenticatedController = global.SixCRM.routes.include('controllers', 'endpoints/components/authenticated.js');
			let authenticatedController = new AuthenticatedController();

			expect(authenticatedController.isUserIntrospection(event)).to.be.true;
		});

		it('returns false when event body does not have a valid user introspection structure', () => {

			let event = getValidGETEvent();

			event.body = "";

			const AuthenticatedController = global.SixCRM.routes.include('controllers', 'endpoints/components/authenticated.js');
			let authenticatedController = new AuthenticatedController();

			expect(authenticatedController.isUserIntrospection(event)).to.be.false;
		});

	});

	describe('acquireAccount', () => {

		it('successfully sets global account', () => {

			let event = getValidGETEvent();

			const AuthenticatedController = global.SixCRM.routes.include('controllers', 'endpoints/components/authenticated.js');
			let authenticatedController = new AuthenticatedController();

			return authenticatedController.acquireAccount(event).then((result) => {
				expect(global.account).to.equal(event.pathParameters.account);
				return expect(result).to.equal(event);
			})
		});

		it('throws error when account is missing in path parameters', () => {

			let event = getValidGETEvent();

			delete event.pathParameters.account;

			const AuthenticatedController = global.SixCRM.routes.include('controllers', 'endpoints/components/authenticated.js');
			let authenticatedController = new AuthenticatedController();

			try {
				authenticatedController.acquireAccount(event)
			} catch(error) {
				expect(error.message).to.equal("[400] Account missing in path parameter.");
			}
		});

	});
});
