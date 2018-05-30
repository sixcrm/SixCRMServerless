const uuidV4 = require('uuid/v4');
const _ = require('lodash');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

module.exports = class StringUtilities {

	static toNumeric(thing) {

		return (1 * thing);

	}

	static clone(thing){

		if(_.isString(thing)){

			return thing.slice(0)

		}

		throw eu.getError('server', 'Thing is not a string.');

	}

	static extractJSON(message) {

		let json_start = message.indexOf('{');

		if (json_start > -1) {

			let json_substring = message.substring(json_start);

			if (this.isValidJSON(json_substring)) {
				return json_substring;
			}

		}

		return null;

	}

	static isValidJSON(string, fatal = false) {

		let error = null;

		try {
			JSON.parse(string);
		} catch (e) {
			error = e;
		}

		if (!_.isNull(error)) {

			if (fatal) {
				throw eu.getError('server', 'Invalid JSON');
			}

			return false;

		}

		return true;

	}

	static pluralize(thing, fatal) {

		fatal = _.isUndefined(fatal) ? true : fatal;

		this.isString(thing, fatal)

		if (this.isMatch(thing, /^.*[^aeiou]y$/)) {
			thing = thing.replace(/y$/, 'ie');
		}

		thing = thing + 's';

		return thing;

	}

	static parseJSONString(thing, fatal = false) {

		let error = null;
		let data = null;

		if (this.isString(thing, fatal)) {

			try {
				data = JSON.parse(thing);
			} catch (e) {
				error = e;
			}

		}

		if (!_.isNull(error)) {

			if (fatal == true) {
				throw eu.getError('server', 'Thing is not a parsable JSON string');
			}

			return null;

		}

		return data;

	}

	static isNumeric(thing, fatal = false) {

		if (this.isString(thing, fatal)) {

			let is_numeric = (!isNaN(thing) && isFinite(thing));

			if (is_numeric) {

				return true;

			}

		}

		if (fatal) {
			throw eu.getError('server', '"' + thing + '" is not numeric');
		}

		return false;

	}

	static nonEmpty(thing, fatal) {

		fatal = (_.isUndefined(fatal)) ? false : fatal;

		if (this.isString(thing, fatal)) {

			let nonempty = (thing.trim().length > 0);

			if (nonempty) {

				return true;

			}

			if (fatal) {

				throw eu.getError('server', 'Empty string');

			}

		} else {

			if (fatal) {

				throw eu.getError('server', 'Not a string: ' + thing);

			}

		}

		return false;

	}

	static getUUID() {

		return uuidV4();

	}

	static isUUID(a_string, version) {

		if (this.isString(a_string)) {

			if (_.isUndefined(version)) {
				version = 4;
			}

			try {
				return global.SixCRM.validate(a_string, global.SixCRM.routes.path('model', 'definitions/uuidv' + version), null, false)
			} catch (e) {
				return false;
			}
		}

		return false;

	}

	static isURL(a_string) {

		if (this.isString(a_string)) {

			try {
				return global.SixCRM.validate(a_string, global.SixCRM.routes.path('model', 'definitions/url.json'))
			} catch (e) {
				return false;
			}

		}

		return false;

	}

	static isPhone(a_string) {

		if (this.isString(a_string)) {

			try {
				return global.SixCRM.validate(a_string, global.SixCRM.routes.path('model', 'definitions/phone.json'))
			} catch (e) {
				return false;
			}

		}

		return false;

	}

	static isEmail(a_string) {

		if (this.isString(a_string)) {

			try {
				return global.SixCRM.validate(a_string, global.SixCRM.routes.path('model', 'definitions/email'), false)
			} catch (e) {
				return false;
			}

		}

		return false;

	}

	static uppercaseFirst(a_string) {

		this.isString(a_string, true);

		return a_string.charAt(0).toUpperCase() + a_string.slice(1);

	}

	static isMatch(a_string, regex) {

		this.isString(a_string, true);

		this.isRegex(regex, true);

		let matches = a_string.match(regex);

		if (_.isArray(matches) && matches.length > 0) {
			return true;
		}

		return false;

	}

	static isRegex(regex, fatal) {

		if (_.isUndefined(fatal)) {
			fatal = false;
		}

		if (_.isRegExp(regex)) {
			return true;
		}

		//this doesn't work here....
		if (fatal) {
			throw eu.getError('server', 'StringUtilities.isRegex argument is not an regular expression.');
		}

		return false;

	}

	static stripHTML(string_object) {

		let striptags = require('striptags');

		return striptags(string_object);

	}

	static escapeCharacter(content, character) {

		var re = new RegExp(character, "g");

		return content.replace(re, '\\' + character);

	}

	static removeWhitespace(string) {

		return string.replace(/[\s\t\r\n]/g, '');

	}

	static removeNonAlphaNumeric(string) {

		return string.replace(/[^0-9a-z]/gi, '');

	}

	static abbreviate(input, length) {

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

	static isString(thing, fatal) {

		fatal = (_.isUndefined(fatal)) ? false : fatal;

		if (!_.isString(thing)) {

			if (fatal == true) {

				throw eu.getError('server', 'StringUtilities.isString thing argument is not an string.');

			}

			return false;

		}

		return true;

	}

	static matchAll(a_string, regex) {

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

		if (_.isArray(matches) && matches.length > 0) {
			return matches;
		}

		return [];

	}

	static matchGroup(a_string, regex, group_no) {

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

	static replaceAll(string, target_string, replace_string) {

		this.isString(string, true);

		let regex = new RegExp(target_string, "g");

		return string.replace(regex, replace_string);

	}

}
