
const base64utility = require('base-64');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

module.exports = class EncodeUtilities {

	static objectToBase64(object){

		du.debug('Object To Base 64');

		return this.toBase64(JSON.stringify(object));

	}

	static base64ToObject(string){

		du.debug('Base64 To Object');

		return JSON.parse(this.fromBase64(string));

	}

	static toBase64(string){

		du.debug('To Base64');

		return base64utility.encode(string);

	}

	static fromBase64(string){

		du.debug('From Base64');

		return base64utility.decode(string);

	}

}
