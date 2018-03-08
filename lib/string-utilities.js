'use strict';
const _ = require('underscore');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');

module.exports = class StringUtilities {

  static pluralize(thing, fatal){

    fatal = _.isUndefined(fatal)?true:fatal;

    this.isString(thing, fatal)

    if(this.isMatch(thing, /^.*[^aeiou]y$/)){
      thing = thing.replace(/y$/, 'ie');
    }

    thing = thing + 's';

    return thing;

  }

  static parseJSONString(thing, fatal){

    fatal = _.isUndefined(fatal)?false:fatal;

    if(this.isString(thing, fatal)){

      try{

        return JSON.parse(thing);

      }catch(error){
        //not a JSON string...
      }

    }

    if(fatal == true){
      eu.throwError('server', 'Thing is not a parsable JSON string');
    }

    return null;

  }

  static isNumeric(thing, fatal){

    fatal = (_.isUndefined(fatal))?false:fatal;

    if(this.isString(thing, fatal)){

      let is_numeric = !isNaN(thing);

      if(is_numeric){

        return true;

      }

    }

    if(fatal){
      eu.throwError('server', '"'+thing+'" is not numeric');
    }

    return false;

  }
    static nonEmpty(thing, fatal){

      fatal = (_.isUndefined(fatal))?false:fatal;

      if(this.isString(thing, fatal)){

        let nonempty = (thing.trim().length > 0);

        if(nonempty){

          return true;

        }

        if(fatal){

          eu.throwError('server', 'Empty string');

        }

      }else{

        if(fatal){

          eu.throwError('server', 'Not a string: '+thing);

        }

      }

      return false;

    }

    static isUUID(a_string, version){

      if(this.isString(a_string)){

        if(_.isUndefined(version)){
          version = 4;
        }

        try {
          return mvu.validateModel(a_string, global.SixCRM.routes.path('model', 'definitions/uuidv'+version))
        } catch(e) {
          return false;
        }
      }

      return false;

    }

    static isEmail(a_string){

      if(this.isString(a_string)){

          try {
              return mvu.validateModel(a_string, global.SixCRM.routes.path('model', 'definitions/email'))
          } catch(e) {
             return false;
          }

      }

      return false;

    }

    static uppercaseFirst(a_string){

      this.isString(a_string, true);

      return a_string.charAt(0).toUpperCase() + a_string.slice(1);

    }

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

      let striptags = require('striptags');

      return striptags(string_object);

    }

    static escapeCharacter(content, character){

      var re = new RegExp(character,"g");

      return content.replace(re, '\\'+character);

    }

    static removeWhitespace(string){

      return string.replace(/[\s\t\r\n]/g, '');

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

      fatal = (_.isUndefined(fatal))?false:fatal;

      if(!_.isString(thing)){

        if(fatal == true){

          eu.throwError('server','StringUtilities.isString thing argument is not an string.');

        }

        return false;

      }

      return true;

    }

    static matchAll(a_string, regex){

      this.isString(a_string, true);

      this.isRegex(regex, true);

      //Technical Debt:  Test immediately!
      /*
      let regex = /\{\{([^{}]*)\}\}/g;

      let tokens = [];
      let m = null;

      while (m = regex.exec(content)) {
        tokens.push(m[0]);
      }
      */

      let matches = a_string.match(regex);

      if(_.isArray(matches) && matches.length > 0){
        return matches;
      }

      return [];

    }

    static matchGroup(a_string, regex, group_no){

      this.isString(a_string, true);

      this.isRegex(regex, true);

      group_no || (group_no = 0);
      let matches = [];
      let match;

      do {
       match = regex.exec(a_string);
         if (match && match[group_no]) {
           matches.push(match[group_no]);
         }
      } while (match);

      return matches;

    }

    static replaceAll(string, target_string, replace_string){

      this.isString(string, true);

      let regex = new RegExp(target_string, "g");

      return string.replace(regex, replace_string);

    }

}
