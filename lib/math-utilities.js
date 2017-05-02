'use strict';
const rs = require('randomstring');
const _ = require('underscore');

class MathUtilities {

    static safePercentage(numerator, denominator, precision){

        if(_.isUndefined(precision)){ precision = 2; }

        numerator = parseFloat(numerator);
        denominator = parseFloat(denominator);

        if (denominator == 0){ return (0.0).toFixed(precision); }

        return (parseFloat(numerator/denominator) * 100).toFixed(precision);

    }

}

module.exports = MathUtilities;
