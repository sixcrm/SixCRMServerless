'use strict'
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

module.exports = class CreditCardHelper {

  constructor(){

  }

  getExpirationMonth(creditcard){

    du.debug('Get Expiration Month');

    return creditcard.expiration.split('/')[0];

  }

  getExpirationYear(creditcard){

    du.debug('Get Expiration Year');

    return creditcard.expiration.split('/')[1];

  }

};
