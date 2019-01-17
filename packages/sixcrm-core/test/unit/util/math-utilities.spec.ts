import * as chai from 'chai';
const expect = chai.expect;
import mathUtilities from '../../../src/util/math-utilities';

describe('lib/math-utilities', () => {

	describe('safePercentage', () => {

		it('returns 0.00 when denominator is 0', () => {
			expect(mathUtilities.safePercentage(1, 0)).to.equal(0.00.toFixed(2));
		});

		it('returns percentage of specified values with precision of 3', () => {
			const numerator = 10;
			const denominator = 7;
			const precision = 3;
			const result = 142.857142857; // 10:7*100

			expect(mathUtilities.safePercentage(numerator, denominator, precision)).to.equal(result.toFixed(precision));
		});
	});

	describe('formatToPercentage', () => {

		it('returns specified value with default precision', () => {
			expect(mathUtilities.formatToPercentage(1)).to.equal(1.00.toFixed(2));
		});
	});

	describe('sum', () => {

		it('throws error when argumentation is not an array', () => {
			try {
				mathUtilities.sum(1 as any, 1);
			} catch (error) {
				expect(error.message).to.equal('[500] ' + 'Unexpected argumentation to mathutilities.calculateSum');
			}
		});

		it('throws error when array argument is not a number', () => {
			try {
				mathUtilities.sum(['a', 'b'] as any, 1);
			} catch (error) {
				expect(error.message).to.equal('[500] ' + 'Array argument to mathutilities.calculateSum must be numeric');
			}
		});

		it('returns base itself when array is empty', () => {
			expect(mathUtilities.sum([], 1)).to.equal(1);
		});
	});

	describe('calculateLSS', () => {

		it('throws error when specified arguments are not arrays', () => {
			try {
				mathUtilities.calculateLSS(1, 1);
			} catch (error) {
				expect(error.message).to.equal('[500] ' + 'Unexpected argumentation to mathutilities.calculateLSS');
			}
		});

		it('throws error when arrays are not the same length', () => {
			try {
				mathUtilities.calculateLSS([1], [1, 2]);
			} catch (error) {
				expect(error.message).to.equal('[500] ' + 'Array arguments to mathutilities.calculateLSS must be of equivalent length');
			}
		});

		it('throws error when array is empty', () => {
			try {
				mathUtilities.calculateLSS([], []);
			} catch (error) {
				expect(error.message).to.equal('[500] ' + 'Array arguments to mathutilities.calculateLSS must be of non-zero length');
			}
		});

		it('throws error when array arguments are not numbers', () => {
			try {
				mathUtilities.calculateLSS(['a'], ['b']);
			} catch (error) {
				expect(error.message).to.equal('[500] ' + 'Array arguments to mathutilities.calculateLSS must be numeric');
			}
		});

		it('successfully calculates LSS', () => {
			expect(mathUtilities.calculateLSS([1, 2, 3], [3, 2, 1])).to.equal(8);
			expect(mathUtilities.calculateLSS([2, 2, 2], [3, 2, 1])).to.equal(2);
			expect(mathUtilities.calculateLSS([30, 20], [11, 17])).to.equal(370);
			expect(mathUtilities.calculateLSS([90, -1, 0, 123], [-11, 81, 70, 17])).to.equal(33061);
		});
	});

	describe('signIdempotentModulus', () => {

		it('returns NaN when base is 0', () => {
			expect(mathUtilities.signIdempotentModulus(1, 0, false)).to.be.NaN;
		});

		it('throws error when base is 0 and fatal value is set to true', () => {
			try {
				mathUtilities.signIdempotentModulus(1, 0, true);
			} catch (error) {
				expect(error.message).to.equal('[500] You cannot perform modulus counting when the base is 0');
			}
		});
	});
});
