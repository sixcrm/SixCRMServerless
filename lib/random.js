'use strict';
const rs = require('randomstring');
const _ = require('underscore');

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

}

module.exports = Random;
