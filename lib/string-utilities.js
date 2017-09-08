'use strict';
const _ = require('underscore');
const striptags = require('striptags');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

module.exports = class StringUtilities {

    static isMatch(a_string, regex){

      this.isString(a_string, true);

      this.isRegex(regex, true);

      let matches = a_string.match(regex);

      if(_.isArray(matches) && matches.length > 0){
        return true;
      }

      return false;

    }

    static isRegex(regex, fatal){

      if(_.isUndefined(fatal)){
        fatal = false;
      }

      if(_.isRegExp(regex)){
        return true;
      }

      //this doesn't work here....
      if(fatal){
        eu.throwError('server', 'StringUtilities.isRegex argument is not an regular expression.');
      }

      return false;

    }

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

    static isString(thing, fatal){

      if(!_.isString(thing)){

        if(!_.isUndefined(fatal) && fatal ==true){

          eu.throwError('server','StringUtilities.isString thing argument is not an string.');

        }

        return false;

      }

      return true;

    }

    static replaceAll(string, substring){

      String.prototype.replaceAll = function(search, replacement) {
          var target = this;

          return target.replace(new RegExp(search, 'g'), replacement);
      };

    }

}
