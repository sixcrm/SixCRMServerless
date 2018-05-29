const chai = require('chai');
const expect = chai.expect;
const mockery = require('mockery');

describe('controllers/providers/jwt-provider', () => {

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
	});

	after(() => {
		mockery.deregisterAll();
	});

	describe('createJWTContents', () => {

		it('throws error when JWT type is unexpected', () => {

			const JWTProvider = global.SixCRM.routes.include('controllers', 'providers/jwt-provider.js');
			const jwtprovider = new JWTProvider();

			jwtprovider.jwt_type = 'invalid_type';

			try {
				jwtprovider.createJWTContents({
					user: 'a_user'
				})
			} catch (error) {
				expect(error.message).to.equal('[500] Unrecognized JWT Type.');
			}
		});
	});

	describe('getUserEmail', () => {

		it('throws error when user email is undefined', () => {

			const JWTProvider = global.SixCRM.routes.include('controllers', 'providers/jwt-provider.js');
			const jwtprovider = new JWTProvider();

			try {
				jwtprovider.getUserEmail({
					user: 'a_user'
				})
			} catch (error) {
				expect(error.message).to.equal('[500] Unable to get user email.');
			}
		});
	});

	describe('getJWTType', () => {

		it('throws error when user email is undefined', () => {

			const JWTProvider = global.SixCRM.routes.include('controllers', 'providers/jwt-provider.js');
			const jwtprovider = new JWTProvider();

			delete jwtprovider.jwt_type;

			try {
				jwtprovider.getJWTType()
			} catch (error) {
				expect(error.message).to.equal('[500] Unset jwt_type property.');
			}
		});
	});

	describe('validateInput', () => {

		it('throws error when validation function is not a function', () => {

			const JWTProvider = global.SixCRM.routes.include('controllers', 'providers/jwt-provider.js');
			const jwtprovider = new JWTProvider();

			try {
				jwtprovider.validateInput({}, 'not_a_function')
			} catch (error) {
				expect(error.message).to.equal('[500] Validation function is not a function.');
			}
		});

		it('throws error when object is undefined', () => {

			const JWTProvider = global.SixCRM.routes.include('controllers', 'providers/jwt-provider.js');
			const jwtprovider = new JWTProvider();

			try {
				jwtprovider.validateInput(null, function () {})
			} catch (error) {
				expect(error.message).to.equal('[500] Undefined object input.');
			}
		});
	});

	describe('getSigningKey', () => {

		it('throws error when transaction JWT secret key is not defined', () => {

			const JWTProvider = global.SixCRM.routes.include('controllers', 'providers/jwt-provider.js');
			const jwtprovider = new JWTProvider();

			jwtprovider.jwt_type = 'transaction';
			jwtprovider.jwt_parameters = {};

			try {
				jwtprovider.getSigningKey()
			} catch (error) {
				expect(error.message).to.equal('[500] Transaction JWT secret key is not defined.');
			}
		});

		it('throws error when site JWT secret key is not defined', () => {

			const JWTProvider = global.SixCRM.routes.include('controllers', 'providers/jwt-provider.js');
			const jwtprovider = new JWTProvider();

			jwtprovider.jwt_type = 'site';
			jwtprovider.jwt_parameters = {};

			try {
				jwtprovider.getSigningKey()
			} catch (error) {
				expect(error.message).to.equal('[500] Site JWT secret key is not defined.');
			}
		});

		it('throws error when JWT type is not valid', () => {

			const JWTProvider = global.SixCRM.routes.include('controllers', 'providers/jwt-provider.js');
			const jwtprovider = new JWTProvider();

			jwtprovider.jwt_type = 'unrecognized_type'; //invalid jwt type

			try {
				jwtprovider.getSigningKey()
			} catch (error) {
				expect(error.message).to.equal('[500] Unrecognized JWT Type.');
			}
		});
	});

	describe('setJWTType', () => {

		it('throws error when jwt type is invalid', () => {

			const JWTProvider = global.SixCRM.routes.include('controllers', 'providers/jwt-provider.js');
			const jwtprovider = new JWTProvider();

			jwtprovider.jwt_type = 'unrecognized_type'; //invalid jwt type

			try {
				jwtprovider.setJWTType('unrecognized_type')
			} catch (error) {
				expect(error.message).to.equal('[500] Unrecognized JWT Type.');
			}
		});
	});

	describe('signJWT', () => {

		it('returns response from jwt sign', () => {

			mockery.registerMock('jsonwebtoken', {
				sign: () => {
					return 'a_jwt';
				}
			});

			const JWTProvider = global.SixCRM.routes.include('controllers', 'providers/jwt-provider.js');
			const jwtprovider = new JWTProvider();

			jwtprovider.jwt_type = 'site'; //valid value

			//secret key with example value
			jwtprovider.jwt_parameters = {
				site_jwt_secret_key: 'a_key'
			};

			expect(jwtprovider.signJWT('a_body')).to.equal('a_jwt');
		});
	});

	describe('getUserAlias', () => {

		it('returns user alias', () => {

			const JWTProvider = global.SixCRM.routes.include('controllers', 'providers/jwt-provider.js');
			const jwtprovider = new JWTProvider();

			expect(jwtprovider.getUserAlias({
				user_alias: 'an_alias'
			})).to.equal('an_alias');
		});

		it('returns user alias based on user id', () => {

			mockery.registerMock(global.SixCRM.routes.path('lib', 'munge-utilities.js'), {
				munge: () => {
					return 'a_munge_string'
				}
			});

			const JWTProvider = global.SixCRM.routes.include('controllers', 'providers/jwt-provider.js');
			const jwtprovider = new JWTProvider();

			expect(jwtprovider.getUserAlias({
				id: 'an_id'
			})).to.equal('a_munge_string');
		});

		it('returns user alias based on user email', () => {

			mockery.registerMock(global.SixCRM.routes.path('lib', 'munge-utilities.js'), {
				munge: () => {
					return 'a_munge_string'
				}
			});

			const JWTProvider = global.SixCRM.routes.include('controllers', 'providers/jwt-provider.js');
			const jwtprovider = new JWTProvider();

			expect(jwtprovider.getUserAlias({
				email: 'an_email'
			})).to.equal('a_munge_string');
		});

		it('returns null when user alias, id and email are not defined', () => {

			const JWTProvider = global.SixCRM.routes.include('controllers', 'providers/jwt-provider.js');
			const jwtprovider = new JWTProvider();

			expect(jwtprovider.getUserAlias()).to.equal(null);
		});
	});
});
