'use strict';
const _ = require('underscore');
const request = require('request');
const querystring = require('querystring');

const du = global.SixCRM.routes.include('lib', 'debug-utilities');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

module.exports = class MerchantProvider {

    constructor(){


    }

    setMerchantProviderParameters({return_parameters}){

      du.debug('Set Merchant Provider Parameters');

      let merchant_provider_configuration = this.get('MerchantProviderParameters');

      return_parameters = objectutilities.transcribe(this.merchant_provider_parameters.required, merchant_provider_configuration, return_parameters, true);

      return objectutilities.transcribe(this.merchant_provider_parameters.optional, merchant_provider_configuration, return_parameters);

    }

    setVendorParameters({return_parameters}){

      du.debug('Set Vendor Parameters');

      let vendor_configuration = this.get('VendorConfiguration');

      return objectutilities.transcribe(this.vendor_parameters.required, vendor_configuration, return_parameters, true);

    }

    setMethodParameters({return_parameters, method_parameters}){

      du.debug('Set Method Parameters');

      return objectutilities.transcribe(this.method_parameters.required, method_parameters, return_parameters, true);

    }

    postToProcessor({action, method_parameters, request_parameters}){

      du.debug('Post To Processor');

      return new Promise((resolve, reject) => {

        let parameters = this.createParameterObject();

        let endpoint = this.createEndpoint(method_parameters);

        parameters = this.setMethodParameters({method_parameters: method_parameters, return_parameters: parameters});

        parameters = this.setRequestParameters({type: action, request_parameters: request_parameters, return_parameters: parameters});

        this.validateRequestParameters(action, parameters);

        let parameter_querystring = querystring.stringify(parameters);

        var request_options = {
    		  headers: {'content-type' : 'application/x-www-form-urlencoded'},
    		  url: endpoint,
    		  body: parameter_querystring
        };

        request.post(request_options, (error, response, body) => {

          du.warning(error);
          if(_.isError(error)){
            reject(error);
          }

          resolve({response: response, body: body});

        });

      });

    }

    createEndpoint(method_parameters){

      du.debug('Create Endpoint');

      let base = this.get('VendorConfiguration').endpoint;

      if(_.has(method_parameters, 'path')){
        base += method_parameters.path;
      }

      return base;

    }

    createParameterObject(){

      du.debug('Create Parameter Object');

      let return_parameters = this.setVendorParameters({return_parameters:{}});

      return_parameters = this.setMerchantProviderParameters({return_parameters:return_parameters});

      return return_parameters;

    }

    setRequestParameters({type, request_parameters, return_parameters}){

      du.debug('Set Request Parameters');

      objectutilities.hasRecursive(this.transaction_parameters, type+'.required', true);

      return_parameters = objectutilities.transcribe(this.transaction_parameters[type].required, request_parameters, return_parameters, true);

      if(objectutilities.hasRecursive(this.transaction_parameters, type+'.optional')){
        return_parameters = objectutilities.transcribe(this.transaction_parameters[type].optional, request_parameters, return_parameters, false);
      }

      return return_parameters;

    }

    configure(merchant_provider_parameters){

      du.debug('Configure');

      this.setMerchantProviderName();

      this.setVendorConfiguration();

      this.setMerchantProviderParametersObject(merchant_provider_parameters);

    }

    validateRequestParameters(request, parameters_object){

      du.debug('Validate Parameters');

      mvu.validateModel(parameters_object, this.getRequestParametersValidationModelPath(request));

    }

    setVendorConfigurationPath(){

      du.debug('Set Vendor Configuration Path');

      this.set('VendorConfigurationPath', global.SixCRM.configuration.stage+'/vendors/'+this.get('MerchantProviderName')+'.yml');

    }

    setVendorConfiguration(){

      du.debug('Set Vendor Configuration');

      this.setVendorConfigurationPath();

      if(this.has('VendorConfigurationPath')){

        this.set('VendorConfiguration', global.SixCRM.routes.include('config', this.get('VendorConfigurationPath')));

        mvu.validateModel(this.get('VendorConfiguration'), this.getVendorConfigurationValidationModelPath());

      }

    }

    setMerchantProviderParametersObject(merchant_provider_parameters){

      du.debug('Set Merchant Provider Parameters');

      this.set('MerchantProviderParameters', merchant_provider_parameters);

      mvu.validateModel(this.get('MerchantProviderParameters'), this.getMerchantProviderConfigurationValidationModelPath());

    }

    setMerchantProviderName(){

      du.debug('Set Merchant Provider Name');

      this.set('MerchantProviderName', objectutilities.getClassName(this).replace('Controller', ''));

    }

    getVendorConfigurationValidationModel(){

      du.debug('Get Vendor Configuration Validation Model');

      return require(this.getVendorConfigurationValidationModelPath());

    }

    getMerchantProviderConfigurationValidationModel(){

      du.debug('Get Vendor Configuration Validation Model');

      return require(this.getMerchantProviderConfigurationValidationModelPath());

    }

    getVendorConfigurationValidationModelPath(){

      du.debug('Get Vendor Configuration Validation Model Path');

      return global.SixCRM.routes.path('model', 'functional/'+this.get('MerchantProviderName')+'/vendor_configuration.json');

    }

    getMerchantProviderConfigurationValidationModelPath(){

      du.debug('Get Merchant Provider Configuration Validation Model Path');

      return global.SixCRM.routes.path('model', 'functional/'+this.get('MerchantProviderName')+'/merchant_provider_configuration.json');

    }

    getRequestParametersValidationModelPath(request){

      du.debug('Get Request Parameters Validatiaon Model Path');

      return global.SixCRM.routes.path('model', 'functional/'+this.get('MerchantProviderName')+'/'+request+'.json');

    }

    getResponseObject({error, response, body}){

      du.debug('Build Response Object');

      const ResponseObject = global.SixCRM.routes.include('vendors', 'merchantproviders/'+this.get('MerchantProviderName')+'/Response.js');

      let response_object = new ResponseObject(arguments[0]);

      return response_object.getResultJSON();

    }

    has(key){

      du.debug('Has');

      if(_.has(this, key)){
        return this[key];
      }
      return null;

    }

    set(key, value){

      du.debug('Set');

      this[key] = value;

    }

    get(key){

      du.debug('Get');

      if(_.has(this, key)){
        return this[key];
      }

      return null;

    }

}
