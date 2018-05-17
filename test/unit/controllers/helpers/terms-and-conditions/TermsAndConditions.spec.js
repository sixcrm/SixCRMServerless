
const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

describe('controllers/helpers/terms-and-conditions/TermsAndConditions.js', () => {

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

	describe('getLatestTermsAndConditions', () => {

		it('successfully returns the Terms and Conditions document (null input - user)', () => {

			mockery.registerMock(global.SixCRM.routes.path('entities','Account.js'), class {
				constructor(){}
				disableACLs(){}
				enableACLs(){}
				get({id}){
					expect(id).to.be.a('string');
					return Promise.resolve(account);
				}
			});

			const TermsAndConditionsHelperController = global.SixCRM.routes.include('helpers', 'terms-and-conditions/TermsAndConditions.js');
			const termsAndConditionsHelperController = new TermsAndConditionsHelperController();

			return termsAndConditionsHelperController.getLatestTermsAndConditions().then(result => {
				expect(result).to.have.property('title');
				expect(result).to.have.property('body');
				expect(result).to.have.property('version');
			});

		});

		it('successfully returns the Terms and Conditions document (user)', () => {

			mockery.registerMock(global.SixCRM.routes.path('entities','Account.js'), class {
				constructor(){}
				disableACLs(){}
				enableACLs(){}
				get({id}){
					expect(id).to.be.a('string');
					return Promise.resolve(account);
				}
			});

			const TermsAndConditionsHelperController = global.SixCRM.routes.include('helpers', 'terms-and-conditions/TermsAndConditions.js');
			const termsAndConditionsHelperController = new TermsAndConditionsHelperController();

			return termsAndConditionsHelperController.getLatestTermsAndConditions('user').then(result => {
				expect(result).to.have.property('title');
				expect(result).to.have.property('body');
				expect(result).to.have.property('version');
				expect(result.body).not.to.have.string('{{');
				expect(result.body).not.to.have.string('}}');
			});

		});

		it('successfully returns the Terms and Conditions document (owner)', () => {

			let account = MockEntities.getValidAccount();

			mockery.registerMock(global.SixCRM.routes.path('entities','Account.js'), class {
				constructor(){}
				disableACLs(){}
				enableACLs(){}
				get({id}){
					expect(id).to.be.a('string');
					return Promise.resolve(account);
				}
			});

			const TermsAndConditionsHelperController = global.SixCRM.routes.include('helpers', 'terms-and-conditions/TermsAndConditions.js');
			const termsAndConditionsHelperController = new TermsAndConditionsHelperController();

			return termsAndConditionsHelperController.getLatestTermsAndConditions('owner', account.id).then(result => {
				expect(result).to.have.property('title');
				expect(result).to.have.property('body');
				expect(result).to.have.property('version');
				expect(result.body).not.to.have.string('{{');
				expect(result.body).not.to.have.string('}}');
				expect(result.body).to.have.string(account.name);
			});

		});

	});

});
