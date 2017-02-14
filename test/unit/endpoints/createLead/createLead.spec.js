var fs = require('fs');
var path = require('path');
var createLead = require('../../../../controllers/endpoints/createLead');
var chai = require('chai');
var expect = chai.expect;
chai.use(require('../../chaiAssertionHelper'));

describe('endpoints/createLead', function () {
	describe('validateInputs', function () {
		it('should not be valid with no input', function () {
			var actual = createLead.validateInput({});

			return actual.catch((err) => {
				return expect(err).to.deepEqualProcessor(__dirname, 'validateInput.empty');
			})
		});
		it('should not be valid when provided a bad email address', function () {
			var actual = createLead.validateInput(require('./fixtures/invalidEmail'));

			return actual.catch((err) => {
				return expect(err).to.deepEqualProcessor(__dirname, 'validateInput.badEmail');
			})
		});
		it('should pass validations and be returned unchanged', function () {
			var actual = createLead.validateInput(require('./fixtures/validLead'));

		  return expect(actual).to.deepEqualProcessor(__dirname, 'validateInput.valid');
		});
	});
});

