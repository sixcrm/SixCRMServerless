
const _ = require('lodash');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

class NumberUtilities {

	static isNumber(value, fatal){

		fatal = (_.isUndefined(fatal))?false:fatal;

		if(_.isNumber(value)){
			return true;
		}

		if(fatal){
			throw eu.getError('server', 'Not a number: '+value);
		}

		return false;

	}

	static isNatural(number, fatal){

		if(_.isUndefined(fatal)){
			fatal = false;
		}

		if(this.isInteger(number) && number > 0){
			return true;
		}

		if(fatal !== true){
			return false;
		}{
			throw eu.getError('server', 'Not a natural: '+number);
		}


	}

	static isInteger(number, fatal){

		fatal = (_.isUndefined(fatal))?false:fatal;

		if(this.isNumber(number, fatal) && (number % 1 === 0)){

			return true;

		}

		if(fatal){
			throw eu.getError('server', 'Not a integer: '+number);
		}

		return false;

	}

	static isFloat(number){

		return Number(number) === number && ! this.isInteger(number);

	}

	static formatFloat(number, precision){

		precision = (_.isUndefined(precision) || _.isNull(precision))?2:precision;

		if(!this.isNumber(number)){
			return eu.getError('validation','Not an number: '+number);
		}

		if(!this.isNumber(precision)){
			return eu.getError('validation','Not an number: '+precision);
		}

		if(!this.isFloat(number)){
			number = parseFloat(number);
		}

		if(!this.isInteger(precision)){
			precision = parseInt(precision);
		}

		return parseFloat(number.toFixed(precision));

	}

	static toNumber(thing){

		if(this.isNumber(thing)){
			return thing;
		}

		return Number(thing);

	}

	static appendOrdinalSuffix(n){

		this.isNatural(n, true);

		function ordinalSuffixOf(n) {
			var j = n % 10,
				k = n % 100;

			if (j == 1 && k != 11) {
				return "st";
			}
			if (j == 2 && k != 12) {
				return "nd";
			}
			if (j == 3 && k != 13) {
				return "rd";
			}
			return "th";
		}

		return n+ordinalSuffixOf(n);

	}

}

module.exports = NumberUtilities;
