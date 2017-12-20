'use strict';
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const Response = global.SixCRM.routes.include('providers', 'Response.js');

module.exports = class FulfillmentProviderVendorResponse extends Response {

  constructor(){

    super();

    this.parameter_definition = {
      handleResponse:{
        required: {
          error:'error',
          response:'response',
          body:'body'
        },
        optional:{}
      }
    };

    this.parameter_validation = {
      'error':global.SixCRM.routes.path('model','vendors/shippingproviders/response/error.json'),
      'response':global.SixCRM.routes.path('model','vendors/fulfillmentproviders/response/response.json'),
      'body':global.SixCRM.routes.path('model','vendors/shippingproviders/response/body.json'),
      'code': global.SixCRM.routes.path('model','vendors/shippingproviders/response/code.json'),
      'result': global.SixCRM.routes.path('model','vendors/shippingproviders/response/result.json'),
      'message': global.SixCRM.routes.path('model','vendors/shippingproviders/response/message.json'),
      'parsedresponse':global.SixCRM.routes.path('model','vendors/fulfillmentproviders/response/parsedresponse.json'),
    };

    this.result_messages = {
      'success':'Success',
      'fail': 'Failed',
      'error': 'Error'
    };

    this.initialize();

    this.handleResponse(arguments[0]);

  }

  getFulfillmentProviderName(){

    du.debug('Get Fulfillment Provider Name');

    return objectutilities.getClassName(this).replace('Response', '');

  }

  handleResponse(){

    du.debug('Handle Response');

    this.parameters.setParameters({argumentation: arguments[0], action: 'handleResponse'});

    let error = this.parameters.get('error', null, false);

    if(!_.isNull(error)){

      this.handleError(error);

    }else{

      if(_.isFunction(this.determineResultCode)){

        let response = this.parameters.get('response');
        let body = this.parameters.get('body');

        this.validateProviderResponse();

        let result_code = this.determineResultCode({response: response, body: body});
        let result_message = this.determineResultMessage(result_code);

        if(_.isFunction(this.translateResponse)){
          let parsed_response = this.translateResponse(response);

          if(!_.isNull(parsed_response)){
            this.parameters.set('parsedresponse', parsed_response);
          }
        }

        this.setCode(result_code);
        this.setMessage(result_message);

      }

    }

  }

  getParsedResponse(){

    du.debug('Get Parsed Response');

    return this.parameters.get('parsedresponse', null, false);

  }

  setResponse(response){

    du.debug('Set Response');

    this.parameters.set('response', response);

  }

  setAllProperties({code, message, response}){

    du.debug('Set All Properties');

    this.setCode(code);

    this.setMessage(message);

    //this.setResponse(response);

  }

  determineResultCode({response: response, body: body}){

    du.debug('Determine Result');

    if(_.has(response, 'statusCode')){

      if(response.statusCode == 200){

        return 'success';

      }

      return 'fail';

    }

    return 'error';

  }

  determineResultMessage(result_code){

    du.debug('Determine Result Message');

    return this.result_messages[result_code];

  }

  validateProviderResponse(){

    du.debug('Validate Provider Response');

    let fulfillment_provider_name = this.getFulfillmentProviderName();
    let response = this.parameters.get('response');

    mvu.validateModel(response, global.SixCRM.routes.path('model', 'vendors/fulfillmentproviders/'+fulfillment_provider_name+'/response.json'));

    return true;

  }

  handleError(error){

    du.debug('Handle Error');

    this.setCode('error');

    if(_.has(error, 'message')){
      this.setMessage(error.message);
    }else{
      this.setMessage(this.determineResultMessage('error'));
    }

  }

  getResult(){

    du.debug('Get Result');

    return {
      code: this.getCode(),
      response: this.getResponse(),
      message: this.getMessage()
    };

  }

  getResponse(){

    du.debug('Get Response');

    return this.parameters.get('response', null, false);

  }

  setMessage(message){

    du.debug('Set Message');

    this.parameters.set('message', message);

    return true;

  }

  getMessage(){

    du.debug('Get Message');

    return this.parameters.get('message')

  }

  setCode(code){

    du.debug('Set Code');

    this.parameters.set('code', code);

    return true;

  }

  getCode(){

    du.debug('Get Code');

    let code = this.parameters.get('code', null, false);

    if(_.isNull(code)){
      return super.getCode();
    }

    return code;

  }

}
