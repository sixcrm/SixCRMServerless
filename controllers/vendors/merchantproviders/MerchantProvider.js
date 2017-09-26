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
