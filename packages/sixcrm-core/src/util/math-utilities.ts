import * as _ from 'lodash';
import eu from './error-utilities';
import arrayutilities from './array-utilities';
import numberutilities from './number-utilities';

export default class MathUtilities {

	static signIdempotentModulus(n, m, fatal = true) {

		numberutilities.isInteger(n, fatal);
		numberutilities.isInteger(m, fatal);

		if (m === 0) {
			if (fatal) {
				throw eu.getError('server', 'You cannot perform modulus counting when the base is 0');
			}
			return NaN;
		}

		return ((n % m) + m) % m;

	}

	static safePercentage(numerator, denominator, precision = 2) {

		numerator = parseFloat(numerator);
		denominator = parseFloat(denominator);

		if (denominator === 0) { return (0.0).toFixed(precision); }

		// Technical Debt:  Account for divide by 0

		return this.formatToPercentage((numerator / denominator * 100), precision);

	}

	static formatToPercentage(value, precision = 2) {

		return parseFloat(value).toFixed(precision);

	}

	static sum(a_array: number[], base: number = NaN) {

		base = (_.isUndefined(base)) ? NaN : base;
		if (!_.isArray(a_array)) {
			throw eu.getError('server', 'Unexpected argumentation to mathutilities.calculateSum');
		}

		if (!arrayutilities.assureEntries(a_array, 'number')) {
			throw eu.getError('server', 'Array argument to mathutilities.calculateSum must be numeric');
		}

		if (a_array.length < 1) {
			return base;
		}

		if (a_array.length === 1) {
			return a_array[0];
		}

		return arrayutilities.reduce(a_array, (a, b) => a + b, 0);

	}

	static calculateLSS(array_1, array_2) {

		if (!_.isArray(array_1) || !_.isArray(array_2)) {
			throw eu.getError('server', 'Unexpected argumentation to mathutilities.calculateLSS');
		}

		if (array_1.length !== array_2.length) {
			throw eu.getError('server', 'Array arguments to mathutilities.calculateLSS must be of equivalent length');
		}

		if (array_1.length < 1) {
			throw eu.getError('server', 'Array arguments to mathutilities.calculateLSS must be of non-zero length');
		}

		if (!arrayutilities.assureEntries(array_1, 'number') || !arrayutilities.assureEntries(array_2, 'number')) {
			throw eu.getError('server', 'Array arguments to mathutilities.calculateLSS must be numeric');
		}

		const differences = array_1.map((array_1_entry, index) => {

			return Math.pow((array_1_entry - array_2[index]), 2);

		});

		return this.sum(differences);

	}

}
