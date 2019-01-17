import * as base64utility from 'base-64';
import du from './debug-utilities';

export default class EncodeUtilities {

	static objectToBase64(object: any) {

		du.debug('Object To Base 64');

		return this.toBase64(JSON.stringify(object));

	}

	static base64ToObject(string: string) {

		du.debug('Base64 To Object');

		return JSON.parse(this.fromBase64(string));

	}

	static toBase64(string: string) {

		du.debug('To Base64');

		return base64utility.encode(string);

	}

	static fromBase64(string: string) {

		du.debug('From Base64');

		return base64utility.decode(string);

	}

}
