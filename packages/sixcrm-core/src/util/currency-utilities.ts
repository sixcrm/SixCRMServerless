import * as _ from 'lodash';
import du from './debug-utilities';
import eu from './error-utilities';
import numberutilities from './number-utilities';
import stringutilities from './string-utilities';

export default class CurrencyUtilities {

	static isCurrency(currency: string, fatal = false) {

		du.debug('Is Currency');

		const re = /\b\d{1,3}(?:,?\d{3})*(?:\.\d{2})?\b/;

		if (re.test(currency)) {

			return true;

		}

		if (fatal) {

			throw eu.getError('server', 'Not currency: ' + currency);

		}

		return false;

	}

	static toCurrency(value: string | number, fatal: boolean = false) {

		du.debug('To Currency');

		if (numberutilities.isNumber(value, fatal)) {
			return (value as number).toFixed(2);
		}

		if (stringutilities.isNumeric(value, fatal)) {

			const number = parseFloat(value as string);

			return number.toFixed(2);
		}

		return null;

	}

	static toCurrencyString(value: string | number, fatal: boolean = false) {

		du.debug('To Currency String');

		return '$' + this.toCurrency(value, fatal);

	}

}
