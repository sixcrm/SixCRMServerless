
const mockery = require('mockery');
let chai = require('chai');
let expect = chai.expect;

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const JWTProvider = global.SixCRM.routes.include('controllers', 'providers/jwt-provider.js');
const jwtprovider = new JWTProvider();

function getValidUserAlias(){

	return '4ee23a8f5c8661612075a89e72a56a3c6d00df90';
}

function getValidTransactionJWT(){

	let raw_token = jwtprovider.createTransactionJWTContents({user: {user_alias: getValidUserAlias()}});

	du.warning(raw_token);

	return jwtprovider.signJWT(raw_token, global.SixCRM.configuration.site_config.jwt.transaction.secret_key);

}


function getValidEvent(){

	return {
		"type":"TOKEN",
		"methodArn":"arn:aws:execute-api:us-east-1:068070110666:8jmwnwcaic/null/GET/",
		"authorizationToken":getValidTransactionJWT()
	}

}

function setEnvironmentVariables(){

	process.env.jwt_issuer = 'https://development-api.sixcrm.com';
	process.env.transaction_jwt_expiration = global.SixCRM.configuration.site_config.jwt.transaction.expiration;
	process.env.transaction_jwt_secret_key = global.SixCRM.configuration.site_config.jwt.transaction.secret_key;
	process.env.jwt_issuer = global.SixCRM.configuration.site_config.jwt.issuer;

}

describe('controllers/authorizers/verifyTransactionJWT.js', () => {

	before(() => {

		setEnvironmentVariables();
		jwtprovider.setParameters();

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

		it('successfully executes the constructor', () => {

			let VerifyTransactionJWTController = global.SixCRM.routes.include('authorizers', 'verifyTransactionJWT.js');
			new VerifyTransactionJWTController();

		})

	});

	describe('execute', () => {

		it('successfully authorizes a valid Transaction JWT', () => {

			let valid_event = getValidEvent();

			let VerifyTransactionJWTController = global.SixCRM.routes.include('authorizers', 'verifyTransactionJWT.js');
			const verifyTransactionJWTController = new VerifyTransactionJWTController();

			return verifyTransactionJWTController.execute(valid_event).then((result) => {
				expect(result).to.equal(getValidUserAlias())
			});

		});

	});

	describe('assureResources', () => {

		let transaction_jwt_key_temp;

		beforeEach(() => {
			transaction_jwt_key_temp = process.env.transaction_jwt_secret_key;
		});

		afterEach(() => {
			process.env.transaction_jwt_secret_key = transaction_jwt_key_temp;
		});

		it('throws error when JWT secret key is missing', () => {

			delete process.env.transaction_jwt_secret_key;

			let VerifyTransactionJWTController = global.SixCRM.routes.include('authorizers', 'verifyTransactionJWT.js');
			const verifyTransactionJWTController = new VerifyTransactionJWTController();

			try{
				verifyTransactionJWTController.assureResources()
			}catch (error) {
				expect(error.message).to.equal('[500] Missing JWT secret key.')
			}
		});

	});

	describe('acquireToken', () => {

		it('returns false when an event object is missing an authorization token', () => {

			let VerifyTransactionJWTController = global.SixCRM.routes.include('authorizers', 'verifyTransactionJWT.js');
			const verifyTransactionJWTController = new VerifyTransactionJWTController();

			expect(verifyTransactionJWTController.acquireToken()).to.equal(false);
		});

	});

});
