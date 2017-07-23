'use strict';
const _ = require('underscore');

module.exports = class StringUtilities {

    static removeNonAlphaNumeric(string){

      return string.replace(/[^0-9a-z]/gi,'');

    }

    static abbreviate(input, length){

      if (input.trim().length <= length) {
          return input;
      }

      return input.trim().slice(0, length - 3).trim() + '...';

    }

}
