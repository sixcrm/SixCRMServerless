let LambdaResponse = global.SixCRM.routes.include('controllers', 'providers/lambda-response.js');
let chai = require('chai');
let expect = chai.expect;

const anyCode = 200;
const anyBody = {};
const anyEvent = {};
const anyError = { code: 500, name:'Server Error', message: 'Internal Service Error.', issues: [] };

describe('controllers/providers/lambda-response', () => {

	let lambda_response_headers_copy;

	before(() => {
		lambda_response_headers_copy = global.six_lambda_response_headers
	});

	after(() => {
		global.six_lambda_response_headers = lambda_response_headers_copy
	});

	describe('response', () => {

		it('should issue a response', (done) => {
			// given
			let aCode = anyCode;
			let aBody = anyBody;
			let expectedResponse = anyResponse();

			// when
			new LambdaResponse().issueResponse(aCode, aBody, (first, second) => {
				let response = second;

				// then
				expect(response).to.deep.equal(expectedResponse);
				done();
			});
		});

		it('should issue a response with a default code when no code provided', (done) => {
			// given
			let aCode = null;
			let aBody = anyBody;
			let expectedResponse = aResponseWithDefaultCode();

			// when
			new LambdaResponse().issueResponse(aCode, aBody, (first, second) => {
				let response = second;

				// then
				expect(response).to.deep.equal(expectedResponse);
				done();
			});
		});

		it('should issue a response with a default body when no body provided', (done) => {
			// given
			let aCode = anyCode;
			let aBody = null;
			let expectedResponse = aResponseWithDefaultBody();

			// when
			new LambdaResponse().issueResponse(aCode, aBody, (first, second) => {
				let response = second;

				expect(response).to.deep.equal(expectedResponse);
				done();
			});
		});

		it('should issue a response with a body', (done) => {
			// given
			let aCode = anyCode;
			let aBody = 'a_body';
			let expectedResponse = aResponseWithDefaultBody();

			expectedResponse.body = aBody;

			// when
			new LambdaResponse().issueResponse(aCode, aBody, (first, second) => {
				let response = second;

				expect(response).to.deep.equal(expectedResponse);
				done();
			});
		});

		it('should issue an error', (done) => {
			// given
			let anEvent = anyEvent;
			let anError = anyError;
			let expectedResponse = anyErrorResponse();

			// when
			new LambdaResponse().issueError(anError, anEvent, (first, second) => {
				let response = second;

				// then
				expect(response).to.deep.equal(expectedResponse);
				done();
			});
		});

		it('should issue an error when nested message provided', (done) => {
			// given
			let anEvent = anyEvent;
			let anError = anyError;
			let expectedResponse = anyErrorResponse();

			// when
			new LambdaResponse().issueError(anError, anEvent, (first, second) => {
				let response = second;

				// then
				expect(response).to.deep.equal(expectedResponse);
				done();
			});
		});

		it('should issue an error with generic message when no message provided', (done) => {
			// given
			let anEvent = anyEvent;
			let anError = anyError;
			let expectedResponse = anErrorResponseWithGenericMessage();

			// when
			new LambdaResponse().issueError(anError, anEvent, (first, second) => {
				let response = second;

				// then
				expect(response).to.deep.equal(expectedResponse);
				done();
			});
		});

	});

	describe('createResponseBody', () => {

		it('successfully creates response body', () => {

			let a_success = true;
			let any_code = 200;
			let any_response = 'Success';

			const lambdaResponse = new LambdaResponse();

			let result = lambdaResponse.createResponseBody(a_success, any_code, any_response);

			expect(result).to.have.property('success');
			expect(result).to.have.property('code');
			expect(result).to.have.property('response');
		});
	});

	describe('issueSuccess', () => {

		it('should issue a success', () => {

			let any_response = anyResponse();

			const lambdaResponse = new LambdaResponse();

			lambdaResponse.issueSuccess(any_response, ()=>{});

			let response = JSON.parse(lambdaResponse.lambda_response.body)

			expect(response).to.have.property('success');
			expect(response.code).to.equal(200);
			expect(response.response.statusCode).to.equal(200);
			expect(response.response.headers).to.deep.equal(any_response.headers);
			expect(response).to.have.property('response');
		});
	});

	describe('setLambdaResponseHeader', () => {

		it('sets lambda response header', () => {
			let params = {
				key: 'a_key',
				value: 'a_value'
			};

			const lambdaResponse = new LambdaResponse();

			lambdaResponse.setLambdaResponseHeader(params.key, params.value);

			expect(lambdaResponse.lambda_response.headers).to.have.property(params.key);
			expect(lambdaResponse.lambda_response.headers[params.key]).to.equal(params.value);
		});
	});

	describe('setResponseHeader', () => {

		it('sets response header', () => {
			let params = {
				key: 'a_key',
				value: 'a_value'
			};

			const lambdaResponse = new LambdaResponse();

			lambdaResponse.setResponseHeader(params.key, params.value);

			expect(lambdaResponse.lambda_response.headers).to.have.property(params.key);
			expect(lambdaResponse.lambda_response.headers[params.key]).to.equal(params.value);
		});
	});

	describe('assureGlobal', () => {

		it('assures that lambda response headers are defined', () => {

			const lambdaResponse = new LambdaResponse();

			lambdaResponse.assureGlobal();

			expect(global.six_lambda_response_headers).to.be.defined;
		});
	});

	describe('setGlobalHeader', () => {

		it('sets global header', () => {
			let params = {
				key: 'a_key',
				value: 'a_value'
			};

			const lambdaResponse = new LambdaResponse();

			lambdaResponse.setGlobalHeader(params.key, params.value);

			expect(global.six_lambda_response_headers).to.have.property(params.key);
			expect(global.six_lambda_response_headers[params.key]).to.equal(params.value);
		});
	});

	describe('setGlobalHeaders', () => {

		it('sets global headers', () => {
			let params = {
				key: 'a_key',
				value: 'a_value'
			};

			const lambdaResponse = new LambdaResponse();

			lambdaResponse.setGlobalHeaders(params.key, params.value);

			expect(global.six_lambda_response_headers).to.be.defined;
			expect(global.six_lambda_response_headers).to.have.property(params.key);
			expect(global.six_lambda_response_headers[params.key]).to.equal(params.value);
		});
	});

	describe('setLambdaResponseHeaders', () => {

		it('sets lambda response headers', () => {
			let params = {
				key: 'a_key',
				value: 'a_value'
			};

			const lambdaResponse = new LambdaResponse();

			lambdaResponse.setLambdaResponseHeaders(params.key, params.value);

			expect(lambdaResponse.lambda_response.headers).to.have.property(params.key);
			expect(lambdaResponse.lambda_response.headers[params.key]).to.equal(params.value);
		});
	});

	function anyResponse() {
		return {
			statusCode: anyCode,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Max-Age': 86400
			},
			body: '{}'
		};
	}

	function aResponseWithDefaultCode() {
		return {
			statusCode: 500,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Max-Age': 86400
			},
			body: '{}'
		};
	}

	function aResponseWithDefaultBody() {
		return {
			statusCode: anyCode,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Max-Age': 86400
			},
			body: JSON.stringify({
				success: false,
				code: 500,
				response: null,
				error_type: "Server Error",
				message: "Internal Service Error."
			})
		};
	}

	function anyErrorResponse() {
		return {
			statusCode: 500,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Max-Age': 86400
			},
			body:JSON.stringify({
				success:false,
				code:500,
				response:null,
				error_type: "Server Error",
				message: "Internal Service Error.",
				issues:[]
			})
		};
	}

	function anErrorResponseWithGenericMessage() {
		return {
			statusCode: 500,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Max-Age': 86400
			},
			body: JSON.stringify({
				success:false,
				code:500,
				response:null,
				error_type: "Server Error",
				message: "Internal Service Error.",
				issues:[]
			})
		};
	}
});
