'use strict';
let crypto = require('crypto');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');

class HashUtilities {

  static toSHA1(string){

    du.debug('To SHA1');

    stringutilities.isString(string, true);

    return crypto.createHash('sha1').update(string).digest('hex');

  }

  static toBase64(string){

    du.debug('To Base64');

    stringutilities.isString(string, true);

    return new Buffer(string).toString('base64');

  }

}

module.exports = HashUtilities;
