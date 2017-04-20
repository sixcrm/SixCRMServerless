'use strict';
let crypto = require('crypto');
const du = require('./debug-utilities.js');
const random = require('./random.js');

class MungeUtilities {

    static munge(mungestring){

        du.debug('Munge');

        let random_string = random.createRandomString(20);

        let hash = crypto.createHash('sha1').update(mungestring+random_string).digest('hex');

        return hash;

    }

}

module.exports = MungeUtilities;