'use strict';
const rs = require('randomstring');
const _ = require('underscore');

class MathUtilities {

    static isInteger(number){

        return number % 1 === 0;

    }

    static isFloat(number){

        return Number(number) === number && ! this.isInteger(number);

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

}

module.exports = MathUtilities;
