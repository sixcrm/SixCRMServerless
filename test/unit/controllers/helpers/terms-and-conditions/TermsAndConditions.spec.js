
const chai = require("chai");
const expect = chai.expect;

describe('controllers/helpers/terms-and-conditions/TermsAndConditions.js', () => {

	describe('getLatestTermsAndConditions', () => {

		it('successfully returns the Terms and Conditions document (null input - user)', () => {

			const TermsAndConditionsHelperController = global.SixCRM.routes.include('helpers', 'terms-and-conditions/TermsAndConditions.js');
			const termsAndConditionsHelperController = new TermsAndConditionsHelperController();

			return termsAndConditionsHelperController.getLatestTermsAndConditions().then(result => {
				expect(result).to.have.property('title');
				expect(result).to.have.property('body');
				expect(result).to.have.property('version');
			});

		});

		it('successfully returns the Terms and Conditions document (user)', () => {

			const TermsAndConditionsHelperController = global.SixCRM.routes.include('helpers', 'terms-and-conditions/TermsAndConditions.js');
			const termsAndConditionsHelperController = new TermsAndConditionsHelperController();

			return termsAndConditionsHelperController.getLatestTermsAndConditions('user').then(result => {
				expect(result).to.have.property('title');
				expect(result).to.have.property('body');
				expect(result).to.have.property('version');
			});

		});

		it('successfully returns the Terms and Conditions document (owner)', () => {

			const TermsAndConditionsHelperController = global.SixCRM.routes.include('helpers', 'terms-and-conditions/TermsAndConditions.js');
			const termsAndConditionsHelperController = new TermsAndConditionsHelperController();

			return termsAndConditionsHelperController.getLatestTermsAndConditions('owner').then(result => {
				expect(result).to.have.property('title');
				expect(result).to.have.property('body');
				expect(result).to.have.property('version');
			});

		});

	});

});
