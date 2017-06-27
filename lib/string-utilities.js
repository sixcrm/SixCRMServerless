'use strict';
const _ = require('underscore');

class StringUtilities {

    static removeNonAlphaNumeric(string){

        return string.replace(/[^0-9a-z]/gi,'');

    }

}

module.exports = StringUtilities;
