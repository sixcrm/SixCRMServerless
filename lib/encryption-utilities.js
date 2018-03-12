'use strict';
const crypto = require('crypto');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');
const { secret_key } = global.SixCRM.configuration.site_config.data_encryption;

class EncryptionUtilities {
  static encryptAES256(string) {
      du.debug('Encrypt AES-256');

      if (!stringutilities.isString(string)) {
          eu.throwError('server', 'Unrecognized argument type.');
      }

      const cipher = crypto.createCipher('aes256', secret_key);

      return cipher.update(string, 'utf8', 'hex') + cipher.final('hex');
  }

  static decryptAES256(encryption) {
      du.debug('Decrypt AES-256');

      if (!stringutilities.isString(encryption)) {
          eu.throwError('server', 'Unrecognized argument type.');
      }

      const decipher = crypto.createDecipher('aes256', secret_key);

      return decipher.update(encryption, 'hex', 'utf8') + decipher.final('utf8');
  }
}

module.exports = EncryptionUtilities;
