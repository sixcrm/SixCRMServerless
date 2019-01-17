import * as chai from 'chai';
const expect = chai.expect;
import numberUtilities from '../../../src/util/number-utilities';

describe('lib/number-utilities', () => {

	describe('isNumber', () => {

		it('throws error when requested', () => {

			const value = 'a';

			try {
				numberUtilities.isNumber(value, true);
			} catch (error) {
				expect(error.message).to.equal('[500] ' + 'Not a number: ' + value);
			}
		});

		it('returns true for integer numbers', () => {

			const value = 1;

			expect(numberUtilities.isNumber(value)).to.be.true;

		});

		it('returns true for negative numbers', () => {

			const value = -1;

			expect(numberUtilities.isNumber(value)).to.be.true;

		});

		it('returns true for decimal numbers', () => {

			const value = 3.14;

			expect(numberUtilities.isNumber(value)).to.be.true;

		});

		it('returns false for non-number strings', () => {

			const value = 'potato';

			expect(numberUtilities.isNumber(value)).to.be.false;

		});

		it('returns false for arrays', () => {

			const value = [];

			expect(numberUtilities.isNumber(value)).to.be.false;

		});

		it('returns false for objects', () => {

			const value = [];

			expect(numberUtilities.isNumber(value)).to.be.false;

		});

		it('returns true for number-like strings with integers', () => {

			const value = '1';

			expect(numberUtilities.isNumber(value)).to.be.false;

		});

		it('returns true for number-like strings with decimals', () => {

			const value = '1.999';

			expect(numberUtilities.isNumber(value)).to.be.false;

		});

		it('returns true for number-like strings with negative numbers', () => {

			const value = '-1.999';

			expect(numberUtilities.isNumber(value)).to.be.false;

		});
	});

	describe('isNatural', () => {

		it('throws error when number is not natural', () => {

			const value = -1;

			try {
				numberUtilities.isNatural(value, true);
			} catch (error) {
				expect(error.message).to.equal('[500] ' + 'Not a natural: ' + value);
			}
		});
	});

	describe('isFloat', () => {

		it('returns true when number is float', () => {
			expect(numberUtilities.isFloat(1.01)).to.be.true;
		});
	});

	describe('formatFloat', () => {

		it('returns float number with specified precision', () => {
			expect(numberUtilities.formatFloat(1.0123, 2)).to.equal(1.01);
		});

		it('throws error when appointed value is not a number', () => {

			const precision: any = 'a';

			try {
				numberUtilities.formatFloat(1.01, precision);
			} catch (error) {
				expect(error.message).to.equal('[500] ' + 'Not a number: ' + precision);
			}
		});

		it('returns float number with specified precision', () => {

			const value = 1;

			try {
				numberUtilities.formatFloat(value, 2);
			} catch (error) {
				expect(error.message).to.equal('[500] ' + 'Not a float: ' + value);
			}
		});
	});

	describe('toNumber', () => {

		it('returns number when number is appointed', () => {
			expect(numberUtilities.toNumber(1)).to.equal(1);
		});

		it('transforms appointed value to number', () => {
			expect(numberUtilities.toNumber('1')).to.equal(1);
		});
	});

	describe('appendOrdinalSuffix', () => {

		it('return nd suffix when value ends with number 2', () => {
			expect(numberUtilities.appendOrdinalSuffix(2)).to.equal('2nd');
		});

		it('return rd suffix when value ends with number 3', () => {
			expect(numberUtilities.appendOrdinalSuffix(3)).to.equal('3rd');
		});

		it('return th suffix when value ends with any number that is greater than 3 and equal or less than 9', () => {
			expect(numberUtilities.appendOrdinalSuffix(4)).to.equal('4th');
		});
	});
});
