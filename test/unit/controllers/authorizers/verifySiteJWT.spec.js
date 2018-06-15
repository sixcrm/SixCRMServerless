
const mockery = require('mockery');
let chai = require('chai');
let expect = chai.expect;

const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const testutilities = require('@sixcrm/sixcrmcore/util/test-utilities').default;
const JWTProvider = global.SixCRM.routes.include('controllers', 'providers/jwt-provider.js');
const jwtprovider = new JWTProvider();
const arrayutilities = require('@sixcrm/sixcrmcore/util/array-utilities').default;

function getValidSelfSignedJWT(){

	let raw_token = jwtprovider.createSiteJWTContents({user:{email:'owner.user@test.com'}});

	let signing_string = getValidUserSigningStrings()[0].signing_string;

	return jwtprovider.signJWT(raw_token, signing_string);

}

function getDecodedToken(){

	return {
		email: 'owner.user@test.com',
		email_verified: true,
		picture: '',
		iss: 'https://sixcrm.auth0.com/',
		sub: 'google-oauth2|115021313586107803836',
		aud: '',
		exp: 1509339744,
		iat: 1509336144
	};

}

function getValidUserSigningStrings(){

	return [
		{
			"id": "6d662332-9a00-42e7-beef-44fb55142fb7",
			"user": "owner.user@test.com",
			"name": "test key 1",
			"signing_string": "somerandomstringthatprobablyshouldn'tbeused",
			"used_at": null,
			"created_at":"2017-04-06T18:40:41.405Z",
			"updated_at":"2017-04-06T18:41:12.521Z"
		}
	];

}

function getInvalidToken(){

	return 'yJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im93bmVyLnVzZXJAdGVzdC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGljdHVyZSI6IiIsImlzcyI6Imh0dHBzOi8vc2l4Y3JtLmF1dGgwLmNvbS8iLCJzdWIiOiIiLCJhdWQiOiIiLCJleHAiOjE1MDkzMzM0NjgsImlhdCI6MTUwOTMyOTg2OH0.IPem1mYXoRgl4BTnHmtYIwl5MAVNXpMmtQG7glwGkW1';

}

function getValidEvent(){

	return {
		authorizationToken: getValidAuthorizationToken(getValidUser())
	};

}

function getValidAuthorizationToken(user){

	return testutilities.createTestAuth0JWT(user, global.SixCRM.configuration.site_config.jwt.site.secret_key);

}

function getValidUser(){
	return 'owner.user@test.com';
}

function setEnvironmentVariables(){

	process.env.jwt_issuer = 'https://development-api.sixcrm.com';
	process.env.site_jwt_expiration = global.SixCRM.configuration.site_config.jwt.site.expiration;
	process.env.site_jwt_secret_key = global.SixCRM.configuration.site_config.jwt.site.secret_key;
	process.env.jwt_issuer = global.SixCRM.configuration.site_config.jwt.issuer;

}

setEnvironmentVariables();

describe('controllers/authorizers/verifySiteJWT.js', () => {

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

			let VerifySiteJWTController = global.SixCRM.routes.include('authorizers', 'verifySiteJWT.js');
			new VerifySiteJWTController();

		})

	});

	describe('setParameters', () => {

		it('successfully sets the parameters', () => {

			let test_event = getValidEvent();

			let VerifySiteJWTController = global.SixCRM.routes.include('authorizers', 'verifySiteJWT.js');
			const verifySiteJWTController = new VerifySiteJWTController();

			verifySiteJWTController.setParameters(test_event);

			let authorization_token = verifySiteJWTController.parameters.get('encoded_authorization_token');

			expect(authorization_token).to.equal(test_event.authorizationToken);

		});

		it('throws an error when no argument is specified', () => {

			let VerifySiteJWTController = global.SixCRM.routes.include('authorizers', 'verifySiteJWT.js');
			const verifySiteJWTController = new VerifySiteJWTController();

			try{
				verifySiteJWTController.setParameters();
			}catch(error){
				expect(error.message).to.equal('[500] Thing is not an object.');
			}

		});

		it('throws an error when argument with invalid structure is specified', () => {

			let VerifySiteJWTController = global.SixCRM.routes.include('authorizers', 'verifySiteJWT.js');
			const verifySiteJWTController = new VerifySiteJWTController();

			try{
				verifySiteJWTController.setParameters({});
			}catch(error){
				expect(error.message).to.equal('[500] Missing source object field: "authorizationToken".');
			}

		});

	});

	describe('decodeToken', () => {

		it('successfully decodes a valid token', () => {

			let valid_token = getValidAuthorizationToken(getValidUser());

			let VerifySiteJWTController = global.SixCRM.routes.include('authorizers', 'verifySiteJWT.js');
			const verifySiteJWTController = new VerifySiteJWTController();

			verifySiteJWTController.parameters.set('encoded_authorization_token', valid_token);

			return verifySiteJWTController.decodeToken().then(() => {

				let decoded_token = verifySiteJWTController.parameters.get('decoded_authorization_token', {fatal: false});

				du.warning(decoded_token);

				expect(decoded_token).to.have.property('email');
				expect(decoded_token).to.have.property('exp');
				expect(decoded_token.email).to.equal(getValidUser());

			});

		});

		it('fails to decode a invalid token', () => {

			let VerifySiteJWTController = global.SixCRM.routes.include('authorizers', 'verifySiteJWT.js');
			const verifySiteJWTController = new VerifySiteJWTController();

			verifySiteJWTController.parameters.set('encoded_authorization_token', getInvalidToken());

			try{

				verifySiteJWTController.decodeToken();

			}catch(error){

				expect(error.message).to.equal('[400] Unable to decode token.');

			}

		});

	});

	describe('verifyEncodedTokenWithSiteSecretKey', () => {

		it('successfully verifies a valid authorization_token using the site secret key', () => {

			let valid_token = getValidAuthorizationToken(getValidUser());

			du.info(valid_token);

			let VerifySiteJWTController = global.SixCRM.routes.include('authorizers', 'verifySiteJWT.js');
			const verifySiteJWTController = new VerifySiteJWTController();

			verifySiteJWTController.parameters.set('encoded_authorization_token', valid_token);

			return verifySiteJWTController.verifyEncodedTokenWithSiteSecretKey().then(() => {

				let verified_token = verifySiteJWTController.parameters.get('verified_authorization_token');

				expect(verified_token).to.equal(valid_token);

			});

		});

		it('does not verify a invalid authorization_token using the site secret key', () => {

			let invalid_token = getInvalidToken();

			let VerifySiteJWTController = global.SixCRM.routes.include('authorizers', 'verifySiteJWT.js');
			const verifySiteJWTController = new VerifySiteJWTController();

			verifySiteJWTController.parameters.set('encoded_authorization_token', invalid_token);

			return verifySiteJWTController.verifyEncodedTokenWithSiteSecretKey().then(() => {

				let verified_token = verifySiteJWTController.parameters.get('verified_authorization_token', {fatal: false});

				expect(verified_token).to.equal(null);

			});

		});

	});

	describe('getUserSigningStrings', () => {

		it('successfully retrieves user signing strings', () => {

			mockery.registerMock(global.SixCRM.routes.path('entities', 'UserSigningString.js'), class {
				listByUser() {
					return Promise.resolve({usersigningstrings: getValidUserSigningStrings()});
				}
				disableACLs(){}
				enableACLs(){}
				getResult(result, field) {

					du.debug('Get Result');

					return Promise.resolve(result[field]);

				}

			});

			let decoded_token = getDecodedToken();

			let VerifySiteJWTController = global.SixCRM.routes.include('authorizers', 'verifySiteJWT.js');
			const verifySiteJWTController = new VerifySiteJWTController();

			verifySiteJWTController.parameters.set('decoded_authorization_token', decoded_token);

			return verifySiteJWTController.getUserSigningStrings().then(() => {

				let signingstrings = verifySiteJWTController.parameters.get('user_signing_strings', {fatal: false});

				expect(arrayutilities.nonEmpty(signingstrings)).to.equal(true);

			});

		});

	});

	describe('execute', () => {

		it('successfully authorizes a valid JWT', () => {

			let valid_event = getValidEvent();

			mockery.registerMock(global.SixCRM.routes.path('entities', 'UserSigningString.js'), class {
				listByUser() {
					return Promise.resolve({usersigningstrings: getValidUserSigningStrings()});
				}
				disableACLs(){}
				enableACLs(){}
				getResult(result, field) {

					du.debug('Get Result');

					return Promise.resolve(result[field]);

				}

			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'User.js'), class {
				updateProperties({id, properties}) {
					expect(id).to.be.a('string');
					expect(properties).to.be.a('object');
					return Promise.resolve(true);
				}
				disableACLs(){}
				enableACLs(){}
			});

			let VerifySiteJWTController = global.SixCRM.routes.include('authorizers', 'verifySiteJWT.js');
			const verifySiteJWTController = new VerifySiteJWTController();

			return verifySiteJWTController.execute(valid_event).then((result) => {
				expect(result).to.equal(getValidUser())
			});

		});

	});

	describe('verifyEncodedTokenWithUserSigningStrings', () => {

		it('successfully authorizes a valid self-signed JWT', () => {

			mockery.registerMock(global.SixCRM.routes.path('entities', 'UserSigningString.js'), class {
				listByUser() {
					return Promise.resolve({usersigningstrings: getValidUserSigningStrings()});
				}
				disableACLs(){}
				enableACLs(){}
				getResult(result, field){

					du.debug('Get Result');

					return Promise.resolve(result[field]);

				}

			});

			jwtprovider.jwt_parameters.site_jwt_expiration = global.SixCRM.configuration.site_config.jwt.site.expiration;

			let valid_event = getValidEvent();

			let valid_self_signed_jwt = getValidSelfSignedJWT();

			valid_event.authorizationToken = valid_self_signed_jwt;

			let VerifySiteJWTController = global.SixCRM.routes.include('authorizers', 'verifySiteJWT.js');
			const verifySiteJWTController = new VerifySiteJWTController();

			return verifySiteJWTController.execute(valid_event).then((result) => {
				expect(result).to.equal(getValidUser())
			});

		});

	});

	describe('respond', () => {

		it('successfully returns an email from decoded token', () => {

			let valid_token = getValidAuthorizationToken(getValidUser());

			let decoded_token = getDecodedToken();

			du.info(decoded_token);

			mockery.registerMock(global.SixCRM.routes.path('entities', 'User.js'), class {
				updateProperties({id, properties}) {
					expect(id).to.be.a('string');
					expect(properties).to.be.a('object');
					return Promise.resolve(true);
				}
				disableACLs(){}
				enableACLs(){}
			});

			let VerifySiteJWTController = global.SixCRM.routes.include('authorizers', 'verifySiteJWT.js');
			const verifySiteJWTController = new VerifySiteJWTController();

			verifySiteJWTController.parameters.set('verified_authorization_token', valid_token);
			verifySiteJWTController.parameters.set('decoded_authorization_token', decoded_token);

			expect(verifySiteJWTController.respond()).to.equal(decoded_token.email);
		});

	});

});
