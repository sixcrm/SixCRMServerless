'use strict';
const _ = require('underscore');
const querystring = require('querystring');

const du = global.SixCRM.routes.include('lib', 'debug-utilities');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

const Response = global.SixCRM.routes.include('vendors', 'merchantproviders/Response.js');

module.exports = class NMIResponse extends Response {

  constructor({error, response, body}){

    super(arguments[0]);

  }

  mapResponseCode({parsed_response}){

    du.debug('Map Response Code');

    if(parsed_response.response == '1'){
      return 'success';
    }else if(parsed_response.response == '2'){
      return 'declined';
    }

    return 'error';

  }

  mapResponseMessage({parsed_response}){

    du.debug('Map Response Message');

    if(_.has(parsed_response, 'responsetext')){
      return parsed_response.responsetext;
    }

    return null;

  }

  parseResponse({response: response, body:body}){

    du.debug('Parse Response');

    let parsed_response = null;

    try{

      parsed_response = querystring.parse(body);

    }catch(error){

      du.error(error);

      this.handleError(error);

    }

    return parsed_response;

  }

}
