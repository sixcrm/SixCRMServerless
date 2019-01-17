import * as uuidV4 from 'uuid/v4';
import * as _ from 'lodash';
import * as striptags from 'striptags';
import eu from './error-utilities';

export default class StringUtilities {

	static getBytes(thing: string, fatal: boolean = true) {

		this.isString(thing, fatal);

		return Buffer.byteLength(thing, 'utf8');

	}

	static clone(thing: string) {

		if (_.isString(thing)) {

			return thing.slice(0);

		}

		throw eu.getError('server', 'Thing is not a string.');

	}

	static extractJSON(message: string) {

		const json_start = message.indexOf('{');

		if (json_start > -1) {

			const json_substring = message.substring(json_start);

			if (this.isValidJSON(json_substring)) {
				return json_substring;
			}

		}

		return null;

	}

	static isISO8601(string: string, fatal = false) {

		// eslint-disable-next-line no-useless-escape
		const re = /^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/;

		if (re.test(string)) {

			return true;

		}

		if (fatal) {

			throw eu.getError('server', 'Invalid ISO-8601: ' + string);

		}

		return false;

	}

	static isValidJSON(string: string, fatal: boolean = false) {

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

	static pluralize(thing: string, fatal: boolean = true) {

		this.isString(thing, fatal);

		if (this.isMatch(thing, /^.*[^aeiou]y$/)) {
			thing = thing.replace(/y$/, 'ie');
		}

		thing = thing + 's';

		return thing;

	}

	static parseJSONString(thing: string, fatal: boolean = false) {

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

			if (fatal) {
				throw eu.getError('server', 'Thing is not a parsable JSON string');
			}

			return null;

		}

		return data;

	}

	static isNumeric(thing: any, fatal: boolean = false) {

		if (this.isString(thing, fatal)) {

			const is_numeric = (!isNaN(thing) && isFinite(thing));

			if (is_numeric) {

				return true;

			}

		}

		if (fatal) {
			throw eu.getError('server', '"' + thing + '" is not numeric');
		}

		return false;

	}

	static nonEmpty(thing: string, fatal: boolean = false) {

		if (this.isString(thing, fatal)) {

			const nonempty = (thing.trim().length > 0);

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

	static isUUID(a_string: string, version: number = 4) {

		if (this.isString(a_string)) {

			try {
				return global.SixCRM.validate(a_string, global.SixCRM.routes.path('model', 'definitions/uuidv' + version), null, false);
			} catch {
				return false;
			}
		}

		return false;

	}

	static isURL(a_string: string) {

		if (this.isString(a_string)) {

			try {
				return global.SixCRM.validate(a_string, global.SixCRM.routes.path('model', 'definitions/url.json'));
			} catch {
				return false;
			}

		}

		return false;

	}

	static isPhone(a_string: string) {

		if (this.isString(a_string)) {

			try {
				return global.SixCRM.validate(a_string, global.SixCRM.routes.path('model', 'definitions/phone.json'));
			} catch {
				return false;
			}

		}

		return false;

	}

	static isEmail(a_string: string) {

		if (this.isString(a_string)) {

			try {
				return global.SixCRM.validate(a_string, global.SixCRM.routes.path('model', 'definitions/email'), false);
			} catch {
				return false;
			}

		}

		return false;

	}

	static uppercaseFirst(a_string: string) {

		this.isString(a_string, true);

		return a_string.charAt(0).toUpperCase() + a_string.slice(1);

	}

	static isMatch(a_string: string, regex: RegExp) {

		this.isString(a_string, true);

		this.isRegex(regex, true);

		const matches = a_string.match(regex);

		if (matches && matches.length > 0) {
			return true;
		}

		return false;

	}

	static isRegex(regex: any, fatal: boolean = false) {

		if (_.isRegExp(regex)) {
			return true;
		}

		// this doesn't work here....
		if (fatal) {
			throw eu.getError('server', 'StringUtilities.isRegex argument is not an regular expression.');
		}

		return false;

	}

	static stripHTML(string_object) {

		return striptags(string_object);

	}

	static escapeCharacter(content: string, character: string) {

		const re = new RegExp(character, "g");

		return content.replace(re, '\\' + character);

	}

	static removeWhitespace(string: string) {

		return string.replace(/[\s\t\r\n]/g, '');

	}

	static removeNonAlphaNumeric(string: string) {

		return string.replace(/[^0-9a-z]/gi, '');

	}

	static abbreviate(input: string, length: number) {

		if (input.trim().length <= length) {
			return input;
		}

		return input.trim().slice(0, length - 3).trim() + '...';

	}

	static capitalize(input: string) {

		return input.charAt(0).toUpperCase() + input.slice(1);

	}

	static toPascalCase(input: string) {

		let result = this.capitalize(input);

		while (result.indexOf('_') > -1) {

			const underscore = result.indexOf('_');

			result = result.slice(0, underscore) + result[underscore + 1].toUpperCase() + result.slice(underscore + 2);

		}

		return result;

	}

	static isString(thing: any, fatal: boolean = false) {

		if (!_.isString(thing)) {

			if (fatal) {

				throw eu.getError('server', 'StringUtilities.isString thing argument is not an string.');

			}

			return false;

		}

		return true;

	}

	static matchAll(a_string: string, regex: RegExp) {

		this.isString(a_string, true);

		this.isRegex(regex, true);

		// Technical Debt:  Test immediately!
		/*
      let regex = /\{\{([^{}]*)\}\}/g;

      let tokens = [];
      let m = null;

      while (m = regex.exec(content)) {
        tokens.push(m[0]);
      }
      */

		const matches = a_string.match(regex);

		if (matches && matches.length > 0) {
			return matches;
		}

		return [];

	}

	static matchGroup(a_string: string, regex: RegExp, group_no: number = 0) {

		this.isString(a_string, true);

		this.isRegex(regex, true);

		const matches: string[] = [];
		let match: RegExpExecArray | null;

		do {
			match = regex.exec(a_string);
			if (match && match[group_no]) {
				matches.push(match[group_no]);
			}
		} while (match);

		return matches;

	}

	static replaceAll(string: string, target_string: string, replace_string: string) {

		this.isString(string, true);

		const regex = new RegExp(target_string, "g");

		return string.replace(regex, replace_string);

	}

}
