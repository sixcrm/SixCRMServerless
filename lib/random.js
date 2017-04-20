'use strict';
const rs = require('randomstring');

class Random {

    static createRandomString(length){

        return rs.generate({
            readable: true,
            length: length,
            charset: 'alphanumeric',
            capitalization: 'uppercase'
        });

    }

}

module.exports = Random;