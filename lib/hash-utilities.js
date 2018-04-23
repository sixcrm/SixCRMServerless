let crypto = require('crypto');
let _ = require('lodash');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');

class HashUtilities {

	static toHMAC(key, str, encoding) {

		du.debug('To HMAC')

		return crypto.createHmac('sha256', key).update(str, 'utf8').digest(encoding);

	}

	static toSHA1(string) {

		du.debug('To SHA1');

		if (stringutilities.isString(string, false)) {
			return crypto.createHash('sha1').update(string).digest('hex');
		} else if (_.isObject(string)) {
			string = new Buffer(string, 'binary').toString();
			return crypto.createHash('sha1').update(string).digest('hex');
		}

		throw eu.getError('server', 'Unrecognized argument type.');

	}

	static toBase64(string) {

		du.debug('To Base64');

		if (stringutilities.isString(string)) {
			return new Buffer(string).toString('base64');
		} else if (_.isObject(string)) {
			return new Buffer(string, 'binary').toString('base64');
		}

		throw eu.getError('server', 'Unrecognized argument type.');

	}

	static fromBase64(string) {

		du.debug('From Base64');

		if (stringutilities.isString(string)) {
			return new Buffer(string, 'base64').toString('ascii');
		}

		throw eu.getError('server', 'Unrecognized argument type.');

	}

}

module.exports = HashUtilities;
