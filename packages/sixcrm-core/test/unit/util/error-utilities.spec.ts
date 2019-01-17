import * as chai from 'chai';
const expect = chai.expect;
import eu from '../../../src/util/error-utilities';

describe('lib/error-utilities', () => {

	describe('getErrorByName', () => {

		it('returns new not found error', () => {

			const error = eu.getErrorByName('not_found_error');
			expect(error).to.have.property('name').equal('Not Found Error');
			expect(error).to.have.property('message').equal('[404] Not found.');
			expect(error).to.have.property('code').equal(404);

		});

		it('returns null when error type is not valid', () => {

			// invalid error type
			expect(eu.getErrorByName('an_error')).to.equal(null);

		});

	});

	describe('removeNonAlphaNumeric', () => {

		it('returns only alpha numeric characters from string', () => {

			expect(eu.removeNonAlphaNumeric('te*st+err-or')).to.equal('testerror');

		});

	});

});
