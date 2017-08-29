'use strict';
const _ = require('underscore');
const striptags = require('striptags');

module.exports = class StringUtilities {

    static stripHTML(string_object){

      return striptags(string_object);

    }

    static escapeCharacter(content, character){

      var re = new RegExp(character,"g");

      return content.replace(re, '\\'+character);

    }

    static removeNonAlphaNumeric(string){

      return string.replace(/[^0-9a-z]/gi,'');

    }

    static abbreviate(input, length){

      if (input.trim().length <= length) {
          return input;
      }

      return input.trim().slice(0, length - 3).trim() + '...';

    }

    static capitalize(input) {

      return input.charAt(0).toUpperCase() + input.slice(1);

    }

    static toPascalCase(input) {

      let result = this.capitalize(input);

      while (result.indexOf('_') > -1) {

        let underscore = result.indexOf('_');

        result = result.slice(0, underscore) + result[underscore + 1].toUpperCase() + result.slice(underscore + 2);

      }

      return result;

    }

}
