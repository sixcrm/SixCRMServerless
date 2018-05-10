let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function getValidAccessKey() {
	return MockEntities.getValidAccessKey();
}

describe('controllers/authorizers/verifySignature.js', () => {

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

	describe('parseEventSignature', () => {

		it('parses event signature with valid authorization token', () => {

			let event = {
				authorizationToken: 'a:b:c' //length after being split by ':' equal to 3
			};

			let VerifySignatureController = global.SixCRM.routes.include('controllers', 'authorizers/verifySignature.js');
			const verifySignatureController = new VerifySignatureController();

			return verifySignatureController.parseEventSignature(event).then((result) => {
				expect(result).to.deep.equal(['a', 'b', 'c']);
			});
		});

		it('fails to parse event signature when token is an array', () => {

			let event = {
				authorizationToken: 'abc' //will not be an array after being split by ':'
			};

			let VerifySignatureController = global.SixCRM.routes.include('controllers', 'authorizers/verifySignature.js');
			const verifySignatureController = new VerifySignatureController();

			return verifySignatureController.parseEventSignature(event).catch((error) => {
				expect(error).to.equal(false);
			});
		});

		it('fails to parse event signature with invalid authorization token\'s length', () => {

			let event = {
				authorizationToken: 'a:b:c:d' //any length after being split by ':' greater than 3
			};

			let VerifySignatureController = global.SixCRM.routes.include('controllers', 'authorizers/verifySignature.js');
			const verifySignatureController = new VerifySignatureController();

			return verifySignatureController.parseEventSignature(event).catch((error) => {
				expect(error).to.equal(false);
			});
		});
	});

	describe('populateAuthorityUser', () => {

		it('successfully populates authority user', () => {

			let VerifySignatureController = global.SixCRM.routes.include('controllers', 'authorizers/verifySignature.js');
			const verifySignatureController = new VerifySignatureController();

			expect(verifySignatureController.populateAuthorityUser()).to.deep.equal({
				id: 'system@sixcrm.com'
			});
		});
	});

	describe('verifyTimestamp', () => {

		it('successfully verifies timestamp', () => {

			let token_object = {
				timestamp: Date.now()
			};

			let VerifySignatureController = global.SixCRM.routes.include('controllers', 'authorizers/verifySignature.js');
			const verifySignatureController = new VerifySignatureController();

			return verifySignatureController.verifyTimestamp(token_object).then((result) => {
				expect(result).to.deep.equal(token_object);
			});
		});

		it('returns false when timestamp is expired', () => {

			let token_object = {
				//any timestamp with gap bigger than 60 * 60 * 5 from current moment
				timestamp: 1514711901
			};

			let VerifySignatureController = global.SixCRM.routes.include('controllers', 'authorizers/verifySignature.js');
			const verifySignatureController = new VerifySignatureController();

			return verifySignatureController.verifyTimestamp(token_object).catch((error) => {
				expect(error).to.equal(false);
			});
		});
	});

	describe('verifySignature', () => {

		it('successfully verifies signature', () => {

			let token_object = {
				access_key: {
					secret_key: 'a_secret_key' //any secret key
				},
				timestamp: 1516180676827, //any timestamp
				//signature created from specified secret key and timestamp
				signature: 'c7375e049f5d376d8a186957d5b972dd25a57354'
			};

			let VerifySignatureController = global.SixCRM.routes.include('controllers', 'authorizers/verifySignature.js');
			const verifySignatureController = new VerifySignatureController();

			return verifySignatureController.verifySignature(token_object).then((result) => {
				expect(result).to.deep.equal(token_object);
			});
		});

		it('returns false when signature is incorrect', () => {

			let token_object = {
				access_key: {
					secret_key: 'a_secret_key' //any secret key
				},
				timestamp: 1516180676827, //any timestamp
				signature: 'invalid_signature'
			};

			let VerifySignatureController = global.SixCRM.routes.include('controllers', 'authorizers/verifySignature.js');
			const verifySignatureController = new VerifySignatureController();

			return verifySignatureController.verifySignature(token_object).catch((error) => {
				expect(error).to.equal(false);
			});
		});
	});

	describe('createTokenObject', () => {

		it('successfully creates token object', () => {

			let access_key = getValidAccessKey();

			//token with example data in valid format
			let tokens = [access_key.id, 1516180676827, 'c7375e049f5d376d8a186957d5b972dd25a57354'];

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/AccessKey.js'), class {
				getAccessKeyByKey(id) {
					expect(id).to.equal(tokens[0]);
					return Promise.resolve(access_key)
				}
				disableACLs(){}
				enableACLs(){}
			});

			let VerifySignatureController = global.SixCRM.routes.include('controllers', 'authorizers/verifySignature.js');
			const verifySignatureController = new VerifySignatureController();

			return verifySignatureController.createTokenObject(tokens).then((result) => {
				expect(result.access_key).to.have.property('secret_key');
				expect(result.access_key).to.have.property('id');
				expect(result).to.deep.equal({
					access_key: access_key,
					timestamp: tokens[1],
					signature: tokens[2]
				});
			});
		});

		it('throws error when secret key property is missing', () => {

			let access_key = getValidAccessKey();

			//token with example data in valid format
			let tokens = [access_key.id, 1516180676827, 'c7375e049f5d376d8a186957d5b972dd25a57354'];

			delete access_key.secret_key; //remove required property

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/AccessKey.js'), class {
				getAccessKeyByKey(id) {
					expect(id).to.equal(tokens[0]);
					return Promise.resolve(access_key)
				}
				disableACLs(){}
				enableACLs(){}
			});

			let VerifySignatureController = global.SixCRM.routes.include('controllers', 'authorizers/verifySignature.js');
			const verifySignatureController = new VerifySignatureController();

			return verifySignatureController.createTokenObject(tokens).catch((error) => {
				expect(error.message).to.equal('[501] Unset Access Key properties.');
			});
		});

		it('throws error when id property is missing', () => {

			let access_key = getValidAccessKey();

			//token with example data in valid format
			let tokens = [access_key.id, 1516180676827, 'c7375e049f5d376d8a186957d5b972dd25a57354'];

			delete access_key.id; //remove required property

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/AccessKey.js'), class {
				getAccessKeyByKey(id) {
					expect(id).to.equal(tokens[0]);
					return Promise.resolve(access_key)
				}
				disableACLs(){}
				enableACLs(){}
			});

			let VerifySignatureController = global.SixCRM.routes.include('controllers', 'authorizers/verifySignature.js');
			const verifySignatureController = new VerifySignatureController();

			return verifySignatureController.createTokenObject(tokens).catch((error) => {
				expect(error.message).to.equal('[501] Unset Access Key properties.');
			});
		});

		it('throws error when access key is not successfully retrieved', () => {

			let access_key = getValidAccessKey();

			//token with example data in valid format
			let tokens = [access_key.id, 1516180676827, 'c7375e049f5d376d8a186957d5b972dd25a57354'];

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/AccessKey.js'), class {
				getAccessKeyByKey(id) {
					expect(id).to.equal(tokens[0]);
					return Promise.reject(new Error('Retrieval failed'))
				}
				disableACLs(){}
				enableACLs(){}
			});

			let VerifySignatureController = global.SixCRM.routes.include('controllers', 'authorizers/verifySignature.js');
			const verifySignatureController = new VerifySignatureController();

			return verifySignatureController.createTokenObject(tokens).catch((error) => {
				expect(error.message).to.equal('Retrieval failed');
			});
		});
	});

	describe('execute', () => {

		it('successfully executes signature verification', () => {

			let access_key = getValidAccessKey();

			let a_signature = 'c7375e049f5d376d8a186957d5b972dd25a57354';

			let timestamp = Date.now();

			let event = {
				authorizationToken: access_key.id + ':' + timestamp + ':' + a_signature
			};

			mockery.registerMock(global.SixCRM.routes.path('lib', 'signature.js'), {
				validateSignature: (secret, signing_string, signature) => {
					expect(secret).to.equal(access_key.secret_key);
					expect(signature).to.equal(a_signature);
					expect(signing_string).to.equal(timestamp.toString());
					return Promise.resolve(true)
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/AccessKey.js'), class {
				getAccessKeyByKey(id) {
					expect(id).to.equal(access_key.id);
					return Promise.resolve(access_key)
				}
				disableACLs(){}
				enableACLs(){}
			});

			let VerifySignatureController = global.SixCRM.routes.include('controllers', 'authorizers/verifySignature.js');
			const verifySignatureController = new VerifySignatureController();

			return verifySignatureController.execute(event).then((result) => {
				expect(result).to.deep.equal({
					id: 'system@sixcrm.com'
				});
			});
		});
	});
});
