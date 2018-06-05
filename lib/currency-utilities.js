const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const numberutilities = global.SixCRM.routes.include('lib', 'number-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');

class CurrencyUtilities {

	static isCurrency(currency, fatal = false){

		du.debug('Is Currency');

		const re = /\b\d{1,3}(?:,?\d{3})*(?:\.\d{2})?\b/;

		if(re.test(currency)){
			return true;
		}

		if(fatal == true){
			throw eu.getError('server', 'Not currency: '+currency);
		}

		return false;

	}

	static toCurrency(value, fatal = false){

		du.debug('To Currency');

		if(numberutilities.isNumber(value, fatal)){
			return value.toFixed(2);
		}

		if(stringutilities.isNumeric(value, fatal)){

			let number = parseFloat(value);

			return number.toFixed(2);
		}

		return null;

	}

	static toCurrencyString(value, fatal = false){

		du.debug('To Currency String');

		return '$'+this.toCurrency(value, fatal);

	}

}

module.exports = CurrencyUtilities;
