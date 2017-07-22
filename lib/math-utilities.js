'use strict';
const _ = require('underscore');
const eu = global.routes.include('lib', 'error-utilities.js');
const arrayutilities = global.routes.include('lib', 'array-utilities.js');

class MathUtilities {

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

            return eu.getError('validation','Not a integer: '+precision);

        }

        return eu.getError('validation','Not a float: '+number);

    }

    static safePercentage(numerator, denominator, precision){

        if(_.isUndefined(precision)){ precision = 2; }

        numerator = parseFloat(numerator);
        denominator = parseFloat(denominator);

        if (denominator == 0){ return (0.0).toFixed(precision); }

        //Technical Debt:  Account for divide by 0

        return this.formatToPercentage((parseFloat(numerator/denominator) * 100), precision);

    }

    static formatToPercentage(value, precision){

        if(_.isUndefined(precision)){
            precision = 2;
        }

        return parseFloat(value).toFixed(precision);

    }

    static sum(a_array){

      if(!_.isArray(a_array)){
        eu.throwError('server', 'Unexpected argumentation to mathutilities.calculateSum');
      }

      if(!arrayutilities.assureEntries(a_array, 'number')){
        eu.throwError('server', 'Array argument to mathutilities.calculateSum must be numeric');
      }

      if(a_array.length < 1){
        return NaN;
      }

      if(a_array.length == 1){
        return a_array[0];
      }

      return arrayutilities.reduce(a_array, (a,b) => {
        return a+b;
      });

    }

    static power(base, exponent){

      if(!this.isNumber(base)){
        eu.throwError('server', 'MathUtilities.power assumes requires a numeric base.');
      }

      if(!this.isNumber(exponent)){
        eu.throwError('server', 'MathUtilities.power assumes requires a numeric exponent.');
      }

      return Math.pow(base, exponent);

    }

    static calculateLSS(array_1, array_2){

      if(!_.isArray(array_1) || !_.isArray(array_2)){
        eu.throwError('server', 'Unexpected argumentation to mathutilities.calculateLSS');
      }

      if(array_1.length != array_2.length){
        eu.throwError('server', 'Array arguments to mathutilities.calculateLSS must be of equivalent length');
      }

      if(array_1.length < 1){
        eu.throwError('server', 'Array arguments to mathutilities.calculateLSS must be of non-zero length');
      }

      if(!arrayutilities.assureEntries(array_1, 'number') || !arrayutilities.assureEntries(array_2, 'number')){
        eu.throwError('server', 'Array arguments to mathutilities.calculateLSS must be numeric');
      }

      let differences = array_1.map((array_1_entry, index) => {

        return this.power((array_1_entry - array_2[index]), 2);

      });

      return this.sum(differences);

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

module.exports = MathUtilities;
