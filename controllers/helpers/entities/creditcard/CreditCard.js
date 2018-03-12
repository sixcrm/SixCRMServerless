'use strict'
const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

module.exports = class CreditCardHelper {

  constructor(){

  }

  getExpirationMonth(creditcard){

    du.debug('Get Expiration Month');

    if(!_.has(creditcard, 'expiration')){
      eu.throwError('server', 'CreditCardHelper.getExpirationMonth assumes creditcard object contains the expiration property.');
    }

    let expiration_first_two;

    let expiration = creditcard.expiration;

    if(expiration.indexOf('/') !== -1){
      expiration = creditcard.expiration.split('/')[0];
    }

    if(expiration.length == 3 || expiration.length == 5){
      expiration_first_two = '0'+expiration.substr(0, 1);
    }else{
      expiration_first_two = expiration.substr(0, 2);
    }

    if(expiration_first_two.length < 2){
      expiration_first_two = '0'+expiration_first_two;
    }

    return expiration_first_two;

  }

  getExpirationYear(creditcard){

    du.debug('Get Expiration Year');

    if(!_.has(creditcard, 'expiration')){
      eu.throwError('server', 'CreditCardHelper.getExpirationMonth assumes creditcard object contains the expiration property.');
    }

    let expiration_last_two = creditcard.expiration.substr(creditcard.expiration.length - 2);

    return '20'+expiration_last_two;

  }

  lastFour(creditcard_number){

    du.debug('Last Four');

    let last = creditcard_number.slice(-4);
    let first = creditcard_number.replace(/[^0-9]/g,'').slice(0, -4).replace(/[0-9]/g, '*');

    return first+last;

  }

};
