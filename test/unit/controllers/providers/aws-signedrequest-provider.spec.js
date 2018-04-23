const chai = require('chai');
const mockery = require('mockery');
const expect = chai.expect;
const objectutilities = global.SixCRM.routes.include('lib','object-utilities.js');
const du = global.SixCRM.routes.include('lib','debug-utilities.js');

describe('controllers/providers/aws-signedrequest-provider', () => {

	before(() => {
		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
	});

	afterEach(() => {
		mockery.resetCache();
		mockery.deregisterAll();
	});

	describe('constructor', () => {

		it('successfully constructs', () => {

			const AWSSignedRequestProvider = global.SixCRM.routes.include('providers', 'aws-signedrequest-provider.js');
			let awssignedrequestprovider = new AWSSignedRequestProvider();

			expect(objectutilities.getClassName(awssignedrequestprovider)).to.equal('AWSSignedRequestProvider');

		});
	});

	describe('validateEnvironment', () => {

		let process_env;
		beforeEach(() => {
			process_env = process.env;
		});

		afterEach(() => {
			process.env = process_env;
		})

		it('succeeds', () => {

			process.env.AWS_SECRET_ACCESS_KEY = 'abc123';
			process.env.AWS_SESSION_TOKEN = 'blahblah';

			const AWSSignedRequestProvider = global.SixCRM.routes.include('providers', 'aws-signedrequest-provider.js');
			let awssignedrequestprovider = new AWSSignedRequestProvider();

			let result;

			try{
				result = awssignedrequestprovider.validateEnvironment();
			}catch(e){
				expect(e).to.not.be.defined;
			}

			expect(result).to.equal(true);

		});

		it('throws error when missing AWS_SECRET_ACCESS_KEY', () => {

			delete process.env.AWS_SECRET_ACCESS_KEY;
			process.env.AWS_SESSION_TOKEN = 'blahblah';

			const AWSSignedRequestProvider = global.SixCRM.routes.include('providers', 'aws-signedrequest-provider.js');
			let awssignedrequestprovider = new AWSSignedRequestProvider();

			let result;

			try{
				result = awssignedrequestprovider.validateEnvironment();
				expect(false).to.equal(true);
			}catch(e){
				expect(e.message).to.equal('[500] Missing "AWS_SECRET_ACCESS_KEY" in process.env');
			}

		});

		it('throws error when missing AWS_SESSION_TOKEN', () => {

			delete process.env.AWS_SESSION_TOKEN;
			process.env.AWS_SECRET_ACCESS_KEY = 'abc123';

			const AWSSignedRequestProvider = global.SixCRM.routes.include('providers', 'aws-signedrequest-provider.js');
			let awssignedrequestprovider = new AWSSignedRequestProvider();

			let result;

			try{
				result = awssignedrequestprovider.validateEnvironment();
				expect(false).to.equal(true);
			}catch(e){
				expect(e.message).to.equal('[500] Missing "AWS_SESSION_TOKEN" in process.env');
			}

		});

	});

	describe('buildSignedRequest', () => {

		let process_env;
		beforeEach(() => {
			process_env = process.env;
		});

		afterEach(() => {
			process.env = process_env;
		})

		it('successfully builds a signed request', () => {

			process.env.AWS_SECRET_ACCESS_KEY = 'abc123';
			process.env.AWS_SESSION_TOKEN = 'blahblah';

			let body = 'some body';
			let endpoint = 'search-sixcrm-logs-btbeleon7xa576ayj4bx2c54le.us-east-1.es.amazonaws.com';

			const AWSSignedRequestProvider = global.SixCRM.routes.include('providers', 'aws-signedrequest-provider.js');
			let awssignedrequestprovider = new AWSSignedRequestProvider();

			let signed_request = awssignedrequestprovider.buildSignedRequest(endpoint, body);
			expect(signed_request).to.have.property('host');
			expect(signed_request).to.have.property('method');
			expect(signed_request).to.have.property('path');
			expect(signed_request).to.have.property('body');
			expect(signed_request).to.have.property('headers');
			expect(signed_request.headers).to.have.property('Content-Type');
			expect(signed_request.headers).to.have.property('Host');
			expect(signed_request.headers).to.have.property('Content-Length');
			expect(signed_request.headers).to.have.property('X-Amz-Security-Token');
			expect(signed_request.headers).to.have.property('X-Amz-Date');
			expect(signed_request.headers).to.have.property('Authorization');
			expect(signed_request.headers['Content-Type']).to.equal('application/json');
			expect(signed_request.headers['Host']).to.equal(endpoint);
			expect(signed_request.headers['Content-Length']).to.equal(9);
			expect(signed_request.headers['Content-Length']).to.equal(9);
			expect(signed_request.headers['X-Amz-Security-Token']).to.equal(process.env.AWS_SESSION_TOKEN);
			expect(signed_request.headers['Authorization']).to.have.string('AWS4-HMAC-SHA256 Credential=');
			expect(signed_request.headers['Authorization']).to.have.string('SignedHeaders=');
			expect(signed_request.headers['Authorization']).to.have.string('Signature=');
		});
	});

	describe('signedRequest', () => {

		let process_env;
		beforeEach(() => {
			process_env = process.env;
		});

		afterEach(() => {
			process.env = process_env;
		})

		it('successfully performs a signed request', () => {

			process.env.AWS_SECRET_ACCESS_KEY = 'abc123';
			process.env.AWS_SESSION_TOKEN = 'blahblah';

			let body = 'some body';
			let endpoint = 'search-sixcrm-logs-btbeleon7xa576ayj4bx2c54le.us-east-1.es.amazonaws.com';

			mockery.registerMock(global.SixCRM.routes.path('providers', 'http-provider.js'), class {
				constructor(){}
				post(parameters){
					expect(parameters).to.have.property('endpoint');
					expect(parameters).to.have.property('body');
					expect(parameters).to.have.property('headers');
					return Promise.resolve({
						body:JSON.stringify({items: []}),
						statusCode:200
					});
				}
			});

			const AWSSignedRequestProvider = global.SixCRM.routes.include('providers', 'aws-signedrequest-provider.js');
			let awssignedrequestprovider = new AWSSignedRequestProvider();

			return awssignedrequestprovider.signedRequest(endpoint, body).then(result => {
				du.info(result);
			});

		});

	});
	/*
	signedRequest(endpoint, body) {

		du.debug('Signed Request');

		return Promise.resolve()
			.then(() => this.validateEnvironment())
			.then(() => this.buildSignedRequest(endpoint, body))
			.then((request_parameters) => this.executeRequest(request_parameters));

	}
	*/
});
