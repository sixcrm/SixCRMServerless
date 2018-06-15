const _ = require('lodash');
const mockery = require('mockery');
let chai = require('chai');
let expect = chai.expect;

const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const testutilities = require('@sixcrm/sixcrmcore/util/test-utilities').default;
const objectutilities = require('@sixcrm/sixcrmcore/util/object-utilities').default;

const MockEntities = global.SixCRM.routes.include('test','mock-entities.js');

function getDecodedToken(id = null){

	if(_.isNull(id)){
		id = (MockEntities.getValidCustomer()).id;
	}

	return {
		customer: id,
		iss: global.SixCRM.configuration.getBase(),
		sub: '',
		aud: '',
		exp: 1509339744,
		iat: 1509336144
	};

}

function getInvalidToken(){

	return 'yJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im93bmVyLnVzZXJAdGVzdC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGljdHVyZSI6IiIsImlzcyI6Imh0dHBzOi8vc2l4Y3JtLmF1dGgwLmNvbS8iLCJzdWIiOiIiLCJhdWQiOiIiLCJleHAiOjE1MDkzMzM0NjgsImlhdCI6MTUwOTMyOTg2OH0.IPem1mYXoRgl4BTnHmtYIwl5MAVNXpMmtQG7glwGkW1';

}

function getValidEvent(id){

	return {
		authorizationToken: getValidAuthorizationToken(id)
	};

}

function getInvalidEvent(){

	return {
		authorizationToken: getInvalidToken()
	};

}

function getValidAuthorizationToken(id){

	return testutilities.createTestCustomerJWT(id);

}

describe('controllers/authorizers/verifyCustomerJWT.js', () => {

	before(() => {
		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
	});

	beforeEach(() => {
		mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {});
	});

	afterEach(() => {
		mockery.resetCache();
		mockery.deregisterAll();
	});

	describe('constructor', () => {

		it('successfully executes the constructor', () => {

			const VerifyCustomerJWTController = global.SixCRM.routes.include('authorizers', 'verifyCustomerJWT.js');
			let verifyCustomerJWTController = new VerifyCustomerJWTController();

			expect(objectutilities.getClassName(verifyCustomerJWTController)).to.equal('VerifyCustomerJWTController');

		});

	});

	describe('setParameters', () => {

		it('successfully sets the parameters', () => {

			let test_event = getValidEvent();

			const VerifyCustomerJWTController = global.SixCRM.routes.include('authorizers', 'verifyCustomerJWT.js');
			let verifyCustomerJWTController = new VerifyCustomerJWTController();

			verifyCustomerJWTController.setParameters(test_event);

			let authorization_token = verifyCustomerJWTController.parameters.get('encoded_authorization_token');

			expect(authorization_token).to.equal(test_event.authorizationToken);

		});

		it('throws an error when no argument is specified', () => {

			const VerifyCustomerJWTController = global.SixCRM.routes.include('authorizers', 'verifyCustomerJWT.js');
			let verifyCustomerJWTController = new VerifyCustomerJWTController();

			try{
				verifyCustomerJWTController.setParameters();
			}catch(error){
				expect(error.message).to.equal('[500] Thing is not an object.');
			}

		});

		it('throws an error when argument with invalid structure is specified', () => {

			const VerifyCustomerJWTController = global.SixCRM.routes.include('authorizers', 'verifyCustomerJWT.js');
			let verifyCustomerJWTController = new VerifyCustomerJWTController();

			try{
				verifyCustomerJWTController.setParameters({});
			}catch(error){
				expect(error.message).to.equal('[500] Missing source object field: "authorizationToken".');
			}

		});

	});

	describe('decodeToken', () => {

		it('successfully decodes a valid token', () => {

			let valid_token = getValidAuthorizationToken();

			const VerifyCustomerJWTController = global.SixCRM.routes.include('authorizers', 'verifyCustomerJWT.js');
			let verifyCustomerJWTController = new VerifyCustomerJWTController();

			verifyCustomerJWTController.parameters.set('encoded_authorization_token', valid_token);

			let result = verifyCustomerJWTController.decodeToken();

			let decoded_token = verifyCustomerJWTController.parameters.get('decoded_authorization_token', {fatal: false});

			du.warning(decoded_token);

			expect(decoded_token).to.have.property('customer');
			expect(decoded_token).to.have.property('exp');

		});

		it('fails to decode a invalid token', () => {

			const VerifyCustomerJWTController = global.SixCRM.routes.include('authorizers', 'verifyCustomerJWT.js');
			let verifyCustomerJWTController = new VerifyCustomerJWTController();

			verifyCustomerJWTController.parameters.set('encoded_authorization_token', getInvalidToken());

			try{

				verifyCustomerJWTController.decodeToken();

			}catch(error){

				expect(error.message).to.equal('[400] Unable to decode token with customer signing string.');

			}

		});

	});

	describe('verifyEncodedTokenWithCustomerSecretKey', () => {

		it('successfully verifies a valid authorization_token using the customer secret key', () => {

			let valid_token = getValidAuthorizationToken();

			const VerifyCustomerJWTController = global.SixCRM.routes.include('authorizers', 'verifyCustomerJWT.js');
			let verifyCustomerJWTController = new VerifyCustomerJWTController();

			verifyCustomerJWTController.parameters.set('encoded_authorization_token', valid_token);

			let result = verifyCustomerJWTController.verifyEncodedTokenWithCustomerSecretKey();
			let verified_token = verifyCustomerJWTController.parameters.get('verified_authorization_token');

			expect(verified_token).to.equal(valid_token);

		});

		it('does not verify a invalid authorization_token using the customer secret key', () => {

			let invalid_token = getInvalidToken();

			const VerifyCustomerJWTController = global.SixCRM.routes.include('authorizers', 'verifyCustomerJWT.js');
			let verifyCustomerJWTController = new VerifyCustomerJWTController();

			verifyCustomerJWTController.parameters.set('encoded_authorization_token', invalid_token);

			try{

				verifyCustomerJWTController.verifyEncodedTokenWithCustomerSecretKey();
				expect(true).to.equal(false, 'Method should not have executed');

			}catch(error){

				expect(error.message).to.equal('[400] Unable to verify authorization token.');

			}


		});

	});

	describe('execute', async () => {

		it('successfully authorizes a valid JWT', async () => {

			const customer = MockEntities.getValidCustomer();
			let valid_event = getValidEvent(customer.id);

			const VerifyCustomerJWTController = global.SixCRM.routes.include('authorizers', 'verifyCustomerJWT.js');
			let verifyCustomerJWTController = new VerifyCustomerJWTController();

			let result = await verifyCustomerJWTController.execute(valid_event);
			expect(result).to.equal(customer.id);

		});

		it('returns null for invalid JWT', async () => {

			let invalid_event = getInvalidEvent();

			const VerifyCustomerJWTController = global.SixCRM.routes.include('authorizers', 'verifyCustomerJWT.js');
			let verifyCustomerJWTController = new VerifyCustomerJWTController();

			let result = await verifyCustomerJWTController.execute(invalid_event);
			expect(result).to.equal(null);


		});

	});

	describe('respond', () => {

		it('successfully returns a customer from decoded token', () => {

			const customer = MockEntities.getValidCustomer();
			let valid_token = getValidAuthorizationToken(customer.id);

			let decoded_token = getDecodedToken(customer.id);

			const VerifyCustomerJWTController = global.SixCRM.routes.include('authorizers', 'verifyCustomerJWT.js');
			let verifyCustomerJWTController = new VerifyCustomerJWTController();

			verifyCustomerJWTController.parameters.set('verified_authorization_token', valid_token);
			verifyCustomerJWTController.parameters.set('decoded_authorization_token', decoded_token);

			expect(verifyCustomerJWTController.respond()).to.equal(customer.id);
		});

		it('returns null otherwise', () => {

			const customer = MockEntities.getValidCustomer();
			let decoded_token = getDecodedToken(customer.id);

			const VerifyCustomerJWTController = global.SixCRM.routes.include('authorizers', 'verifyCustomerJWT.js');
			let verifyCustomerJWTController = new VerifyCustomerJWTController();

			//verifyCustomerJWTController.parameters.set('verified_authorization_token', valid_token);
			verifyCustomerJWTController.parameters.set('decoded_authorization_token', decoded_token);

			expect(verifyCustomerJWTController.respond()).to.equal(null);

		});

	});

});
