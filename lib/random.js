'use strict';
const rs = require('randomstring');
const _ = require('underscore');
const du = require('./debug-utilities.js');

class Random {

    static createRandomString(length){

        return rs.generate({
            readable: true,
            length: length,
            charset: 'alphanumeric',
            capitalization: 'uppercase'
        });

    }

    static selectRandomFromArray(list){

        if(!_.isArray(list)){ throw new Error('List argument must be an array.'); }

        if(list.length < 1){ throw new Error('List argument must be of length one or greater.'); }

        let random_index = Math.floor(Math.random() * list.length);

        return list[random_index];

    }

    static randomInt(min, max){

        if (min !== parseInt(min, 10)){ throw new Error('Minimum input is not an integer.'); }
        if (max !== parseInt(max, 10)){ throw new Error('Maximum input is not an integer.'); }

        return Math.floor(Math.random() * max) + min;

    }

    static randomDouble(min, max, precision){

        if(_.isUndefined(precision)){
            precision = 2;
        }

        if (min !== parseInt(min, 10)){ throw new Error('Minimum input is not an integer.'); }
        if (max !== parseInt(max, 10)){ throw new Error('Maximum input is not an integer.'); }

        if (precision !== parseInt(precision, 10)){ throw new Error('Precision input is not an integer.'); }

        return parseFloat(Math.min(min + (Math.random() * (max - min)), max).toFixed(precision));

    }

    static randomProbability(probability){

        probability = parseFloat(probability);

        if(!_.isNumber(probability)){
            throw new Error('Probability is not a number.');
        }

        if(probability < 0 || probability > 1){
            throw new Error('Probability must be greater than or eqaul to 0 and less than or equal to 1');
        }

        return !(this.randomDouble(0, 1, 5) > probability);

    }

    static randomGaussian(mean, stdev) {

        let y1, y2;
        let use_last = false;

        if(use_last) {
            y1 = y2;
            use_last = false;
        }else{
            let x1, x2, w;

            do {
                x1 = 2.0 * Math.random() - 1.0;
                x2 = 2.0 * Math.random() - 1.0;
                w  = x1 * x1 + x2 * x2;
            } while(w >= 1.0);
            w = Math.sqrt((-2.0 * Math.log(w))/w);
            y1 = x1 * w;
            y2 = x2 * w;
            use_last = true;
        }

        var retval = mean + stdev * y1;

        return Math.abs(retval);

    }

}

module.exports = Random;
