'use strict';
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

//Technical Debt:  This needs to extend the Response Provider
module.exports = class Response {

  constructor(){

    this.allowed_codes = ['success', 'declined', 'error'];

    this.handleResponse(arguments[0]);

  }

  getMerchantProviderName(){

    du.debug('Set Merchant Provider Name');

    return objectutilities.getClassName(this).replace('Response', '');

  }

  handleResponse({error, response, body}){

    du.debug('Handle Response');

    //du.info(arguments); exit();

    if(!_.isUndefined(error) && !_.isNull(error)){

      this.handleError(error);

    }else{

      let parsed_response = this.parseResponse({response: response, body: body});

      du.highlight(parsed_response);

      if(this.validateResponse(parsed_response)){

        this.setResult(parsed_response);

        this.setResponseProperties(parsed_response);

      }

    }

  }

  setResponseProperties(parsed_response){

    du.debug('Set Response Properties');

    this.setCode(this.mapResponseCode({parsed_response: parsed_response}));

    this.setMessage(this.mapResponseMessage({parsed_response: parsed_response}));

  }

  validateResponse(parsed_response){

    du.debug('Validate Response');

    let validated = true;

    try{

      mvu.validateModel(parsed_response, global.SixCRM.routes.path('model', 'functional/'+this.getMerchantProviderName()+'/response.json'));

    }catch(error){

      validated = false;

      this.handleError(error);

    }

    return validated;

  }

  handleError(error){

    du.debug('Handle Error');

    this.setCode('error');

    if(_.has(error, 'message')){
      this.setMessage(error.message);
    }

    this.setResult(error);

  }

  setCode(code){

    du.debug('SetCode');

    if(_.contains(this.allowed_codes, code)){
      this.code = code;
    }else{
      eu.throwError('server', 'Unrecognized code: "'+code+'".');
    }

  }

  setMessage(message){

    du.debug('Set Message');

    this.message = message;

  }

  setResult(result){

    du.debug('Set Result');

    this.result = result;

  }

  getResultJSON(){

    du.debug('Get Result JSON');

    return {
      code: this.getCode(),
      result: this.getResult(),
      message: this.getMessage()
    };

  }

  getCode(){

    du.debug('Get Code');

    return this.code;

  }

  getResult(){

    du.debug('Get Result');

    return this.result;

  }

  getMessage(){

    du.debug('Get Message');

    return this.message;

  }

}
