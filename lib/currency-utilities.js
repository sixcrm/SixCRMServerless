
const _ = require('lodash');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const numberutilities = global.SixCRM.routes.include('lib', 'number-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');

class CurrencyUtilities {

	static toCurrency(value, fatal){

		du.debug('To Currency');

		fatal = (_.isUndefined(fatal))?false:fatal;

		if(numberutilities.isNumber(value, fatal)){
			return value.toFixed(2);
		}

		if(stringutilities.isNumeric(value, fatal)){

			let number = parseFloat(value);

			return number.toFixed(2);
		}

		return null;

	}

	static toCurrencyString(value, fatal){

		du.debug('To Currency String');

		fatal = (_.isUndefined(fatal))?false:fatal;

		return '$'+this.toCurrency(value, fatal);

	}

}

module.exports = CurrencyUtilities;
