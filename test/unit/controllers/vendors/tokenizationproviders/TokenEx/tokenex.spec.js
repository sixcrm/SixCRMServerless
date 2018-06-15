const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');
const objectutilities = require('@sixcrm/sixcrmcore/util/object-utilities').default;
//const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

describe('vendors/tokenizationproviders/tokenex/tokenex.js', () =>{

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
			const TokenExController = global.SixCRM.routes.include('vendors','tokenizationproviders/tokenex/tokenex.js');
			let tokenExController = new TokenExController();
			expect(objectutilities.getClassName(tokenExController)).to.equal('TokenEx');
		});
	});

	describe('getToken', () => {

		it('successfully makes a request to TokenEx.com and decodes a token', () => {

			let expected_value = 'someplaintextvalue';
			let token = '9IB97FXD2ZLQLWIZF5NNYL0IVNJKMB6C49E8ET';

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/http-provider.js'), class {
				constructor(){}
				postJSON(){
					return Promise.resolve({
						body: {
							"Error":"",
							"ReferenceNumber":"15102913382030662954",
							"Success":true,
							"Value":expected_value
						}
					});
				}
			});

			const TokenExController = global.SixCRM.routes.include('vendors','tokenizationproviders/tokenex/tokenex.js');
			let tokenExController = new TokenExController();

			return tokenExController.getToken(token).then(result => {
				expect(result).to.have.property('value');
				expect(result.value).to.equal(expected_value);
			});

		});

	});

	describe('setToken', () => {

		it('successfully makes a request to TokenEx.com and retrieves a token', () => {

			let expected_value = '9IB97FXD2ZLQLWIZF5NNYL0IVNJKMB6C49E8ET';
			let value = 'someplaintextvalue';

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/http-provider.js'), class {
				constructor(){}
				postJSON(){
					return Promise.resolve({
						body: {
							"Error":"",
							"ReferenceNumber":"15102913382030662954",
							"Success":true,
							"Token":expected_value
						}
					});
				}
			});

			const TokenExController = global.SixCRM.routes.include('vendors','tokenizationproviders/tokenex/tokenex.js');
			let tokenExController = new TokenExController();

			return tokenExController.setToken(value).then(result => {
				expect(result).to.have.property('token');
				expect(result.token).to.equal(expected_value);
			});

		});

	});

	describe('deleteToken', () => {

		it('successfully makes a request to TokenEx.com and deletes a token', () => {

			let expected_value = true;
			let token = '9IB97FXD2ZLQLWIZF5NNYL0IVNJKMB6C49E8ET';

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/http-provider.js'), class {
				constructor(){}
				postJSON(){
					return Promise.resolve({
						body: {
							"Error":"",
							"ReferenceNumber":"15102913382030662954",
							"Success":true
						}
					});
				}
			});

			const TokenExController = global.SixCRM.routes.include('vendors','tokenizationproviders/tokenex/tokenex.js');
			let tokenExController = new TokenExController();

			return tokenExController.deleteToken(token).then(result => {
				expect(result).to.equal(expected_value);
			});

		});

	});

});
