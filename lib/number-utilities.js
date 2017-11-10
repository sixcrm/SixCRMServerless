'use strict';
const _ = require('underscore');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

class NumberUtilities {

    static isNumber(value, fatal){

      if(_.isUndefined(fatal)){
        fatal = false;
      }

      if(fatal !== true){
        return _.isNumber(value);
      }{
        eu.throwError('server', 'Not a number: '+value);
      }

    };

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
        eu.throwError('server', 'Not a natural: '+number);
      }


    }

    static isInteger(number){

        return number % 1 === 0;

    }

    static isFloat(number){

        return Number(number) === number && ! this.isInteger(number);

    }

    static formatFloat(number, precision){

        if(this.isFloat(number)){

            if(this.isInteger(precision)){

                return parseFloat(number).toFixed(precision);

            }

            return eu.getError('validation','Not an integer: '+precision);

        }

        return eu.getError('validation','Not a float: '+number);

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
