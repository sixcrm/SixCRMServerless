'use strict';
const _ = require('underscore');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const numberutilities = global.SixCRM.routes.include('lib', 'number-utilities.js');

class CurrencyUtilities {

  static toCurrency(value, fatal){

    du.debug('To Currency');

    fatal = (_.isUndefined(fatal))?false:fatal;

    numberutilities.isNumber(value, fatal);

    return value.toFixed(2);

  };

  static toCurrencyString(value, fatal){

    du.debug('To Currency String');

    fatal = (_.isUndefined(fatal))?false:fatal;

    return '$'+this.toCurrency(value, fatal);

  };

}

module.exports = CurrencyUtilities;
