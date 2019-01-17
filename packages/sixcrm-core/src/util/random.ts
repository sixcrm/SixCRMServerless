import * as rs from 'randomstring';
import * as _ from 'lodash';
import eu from './error-utilities';

export default class Random {

	static createRandomString(length: number = 32, charset: string = 'alphanumeric', capitalization: string = 'uppercase') {

		return rs.generate({
			readable: true,
			length,
			charset,
			capitalization
		});

	}

	// Technical Debt:  This kind-of works -  I bet it's a non-uniform distribution
	static selectRandomFromArray(list) {

		if (!_.isArray(list)) { throw eu.getError('validation', 'List argument must be an array.'); }

		if (list.length < 1) { throw eu.getError('validation', 'List argument must be of length one or greater.'); }

		const random_index = Math.floor(Math.random() * list.length);

		return list[random_index];

	}

	static randomInt(min, max) {

		min = (_.isUndefined(min)) ? 1 : min;
		max = (_.isUndefined(max)) ? 10000 : max;

		if (min !== parseInt(min, 10)) { throw eu.getError('validation', 'Minimum input is not an integer.'); }
		if (max !== parseInt(max, 10)) { throw eu.getError('validation', 'Maximum input is not an integer.'); }

		return Math.floor(Math.random() * (max - min)) + min;

	}

	static randomDouble(min, max, precision = 2) {

		if (min !== parseInt(min, 10)) { throw eu.getError('validation', 'Minimum input is not an integer.'); }
		if (max !== parseInt(max, 10)) { throw eu.getError('validation', 'Maximum input is not an integer.'); }

		if (precision !== parseInt(precision.toString(), 10)) { throw eu.getError('validation', 'Precision input is not an integer.'); }

		return parseFloat(Math.min(min + (Math.random() * (max - min)), max).toFixed(precision));

	}

	static randomBoolean() {

		return this.randomProbability(0.5);

	}

	static randomProbability(probability) {

		if (!_.isNumber(probability)) {
			throw eu.getError('validation', 'Probability is not a number.');
		}

		if (probability < 0 || probability > 1) {
			throw eu.getError('validation', 'Probability must be greater than or equal to 0 and less than or equal to 1');
		}

		return !(this.randomDouble(0, 1, 5) > probability);

	}

	static randomGaussian(mean, stdev) {

		let y1, y2;
		let use_last = false;

		if (use_last) {
			y1 = y2;
			use_last = false;
		} else {
			let x1, x2, w;

			do {
				x1 = 2.0 * Math.random() - 1.0;
				x2 = 2.0 * Math.random() - 1.0;
				w  = x1 * x1 + x2 * x2;
			} while (w >= 1.0);
			w = Math.sqrt((-2.0 * Math.log(w)) / w);
			y1 = x1 * w;
			y2 = x2 * w;
			use_last = true;
		}

		const retval = mean + stdev * y1;

		return Math.abs(retval);

	}

}
