import * as crypto from 'crypto';

import du from './debug-utilities';
import eu from './error-utilities';
import stringutilities from './string-utilities';
const { secret_key } = global.SixCRM.configuration.site_config.data_encryption;

export default class EncryptionUtilities {

	static encryptAES256(iv_key: string, string: string) {
		du.debug('Encrypt AES-256');

		if (!stringutilities.isString(iv_key) || !stringutilities.isString(string)) {
			throw eu.getError('server', 'Unrecognized argument type.');
		}

		const cipher = crypto.createCipheriv('aes256', Buffer.from(secret_key, 'hex'), this.stringToAESIV(iv_key));

		return cipher.update(string, 'utf8', 'hex') + cipher.final('hex');
	}

	static decryptAES256(iv_key: string, string: string) {
		du.debug('Decrypt AES-256');

		if (!stringutilities.isString(iv_key) || !stringutilities.isString(string)) {
			throw eu.getError('server', 'Unrecognized argument type.');
		}

		const decipher = crypto.createDecipheriv('aes256', Buffer.from(secret_key, 'hex'), this.stringToAESIV(iv_key));

		return decipher.update(string, 'hex', 'utf8') + decipher.final('utf8');
	}

	static stringToAESIV(string: string) {
		return crypto.createHash('sha256').update(string).digest().slice(0, 16);
	}

}
