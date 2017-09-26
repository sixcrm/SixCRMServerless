'use strict';
const _ = require('underscore');
const querystring = require('querystring');

const du = global.SixCRM.routes.include('lib', 'debug-utilities');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

const Response = global.SixCRM.routes.include('vendors', 'merchantproviders/Response.js');

module.exports = class InnovioResponse extends Response {

  constructor({error, response, body}){

    super(arguments[0]);

  }

  mapResponseCode({parsed_response}){

    du.debug('Map Response Code');

    //Technical Debt:  Update this... (note multiple success messages...)
    if(parsed_response.API_RESPONSE == 507){
      return 'success';
    }else if(parsed_response.API_RESPONSE == 600){
      return 'declined';
    }

    return 'error';

  }

  mapResponseMessage({parsed_response}){

    du.debug('Map Response Message');

    if(_.has(parsed_response, 'TRANS_STATUS_NAME')){
      return parsed_response.TRANS_STATUS_NAME;
    }

    return null;

  }

  parseResponse({response: response, body:body}){

    du.debug('Parse Response');

    let parsed_response = null;

    try{

      parsed_response = JSON.parse(body);

    }catch(error){

      du.error(error);

      this.handleError(error);

    }

    return parsed_response;

  }

}
