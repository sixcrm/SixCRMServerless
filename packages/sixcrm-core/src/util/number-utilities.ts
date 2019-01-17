import * as _ from 'lodash';
import eu from './error-utilities';

export default class NumberUtilities {

	static isNumber(value: any, fatal: boolean = false) {

		if (_.isNumber(value)) {
			return true;
		}

		if (fatal) {
			throw eu.getError('server', 'Not a number: ' + value);
		}

		return false;

	}

	static isNatural(number: any, fatal: boolean = false) {

		if (this.isInteger(number) && number > 0) {
			return true;
		}

		if (fatal) {
			throw eu.getError('server', 'Not a natural: ' + number);
		}

		return false;

	}

	static isInteger(number: any, fatal: boolean = false) {

		if (this.isNumber(number, fatal) && (number % 1 === 0)) {

			return true;

		}

		if (fatal) {
			throw eu.getError('server', 'Not a integer: ' + number);
		}

		return false;

	}

	static isFloat(number: any) {

		return Number(number) === number && ! this.isInteger(number);

	}

	static formatFloat(number: number, precision: number = 2) {

		if (!this.isNumber(number)) {
			throw eu.getError('validation', 'Not a number: ' + number);
		}

		if (!this.isNumber(precision)) {
			throw eu.getError('validation', 'Not a number: ' + precision);
		}

		if (!this.isInteger(precision)) {
			precision = Math.floor(precision);
		}

		return parseFloat(number.toFixed(precision));

	}

	static toNumber(thing: any) {

		if (this.isNumber(thing)) {
			return thing as number;
		}

		return Number(thing);

	}

	static appendOrdinalSuffix(n: number) {

		this.isNatural(n, true);

		function ordinalSuffixOf(no: number) {
			const
				j = no % 10,
				k = no % 100;

			if (j === 1 && k !== 11) {
				return "st";
			}
			if (j === 2 && k !== 12) {
				return "nd";
			}
			if (j === 3 && k !== 13) {
				return "rd";
			}
			return "th";
		}

		return n + ordinalSuffixOf(n);

	}

}
