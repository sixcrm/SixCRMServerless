'use strict';
const _ = require('underscore');
const querystring = require('querystring');

const du = global.SixCRM.routes.include('lib', 'debug-utilities');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

const Response = global.SixCRM.routes.include('vendors', 'fulfillmentproviders/Response.js');

module.exports = class HashtagResponse extends Response {

  constructor({error, response, body}){

    super(arguments[0]);

  }

  getTransactionID(transaction){

    du.debug('Get Transaction ID');

    let processor_response = null;

    if(_.has(transaction, 'processor_response')){
      processor_response = transaction.processor_response;
      try{
        processor_response = JSON.parse(processor_response);
      }catch(error){
        //do nothing
      }
    }

    if(objectutilities.hasRecursive(processor_response, 'results.transactionid')){
      return processor_response.results.transactionid;
    }

    eu.throwError('server', 'Unable to identify the Transaction ID');

  }

  mapResponseCode({parsed_response}){

    du.debug('Map Response Code');

    return parsed_response;

  }

  mapResponseMessage({parsed_response}){

    du.debug('Map Response Message');

    if(_.has(parsed_response, 'responsetext')){
      return parsed_response.responsetext;
    }

    return null;

  }

  parseResponse({response: response, body: body}){

    du.debug('Parse Response');

    return 'success';

  }

}
