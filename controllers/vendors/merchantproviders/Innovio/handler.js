'use strict';
const _ = require('underscore');
const request = require('request');
const querystring = require('querystring');

const du = global.SixCRM.routes.include('lib', 'debug-utilities');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

const MerchantProvider = global.SixCRM.routes.include('vendors', 'merchantproviders/MerchantProvider.js');

class InnovioController extends MerchantProvider {

    constructor(merchant_provider_parameters){

      super();

      this.configure(merchant_provider_parameters);

    }

    process(request_parameters){

      du.debug('Process');

      const method_parameters = {request_action: 'CCAUTHCAP'};

      return new Promise((resolve, reject) => {

        let parameters = this.createParameterObject();

        parameters = this.setMethodParameters({method_parameters: method_parameters, return_parameters: parameters});

        parameters = this.setRequestParameters({request_parameters: request_parameters, return_parameters: parameters});

        this.validateRequestParameters('process', parameters);

        let parameter_querystring = querystring.stringify(parameters);

        var request_options = {
    		  headers: {'content-type' : 'application/x-www-form-urlencoded'},
    		  url:     this.get('VendorConfiguration').endpoint,
    		  body:    parameter_querystring
        };

        request.post(request_options, (error, response, body) => {

          if(_.isError(error)){
            reject(error);
          }

          resolve(this.getResponseObject({error: error, response: response, body: body}));

        });

      });

    }

    setMethodParameters({return_parameters, method_parameters}){

      du.debug('Set Method Parameters');

      if(_.isUndefined(return_parameters)){ let return_parameters = {}; }

      let method = {
        required: {
          request_action: 'request_action'
        }
      };

      objectutilities.map(method.required, (key) => {

        let six_key = method.required[key];

        if(!_.has(method_parameters, six_key)){
          eu.throwError('server', 'Missing required method parameter: "'+six_key+'".');
        }

        return_parameters[key] = method_parameters[six_key];

      });

      return return_parameters;

    }

    setVendorParameters({return_parameters}){

      du.debug('Set Vendor Parameters');

      if(_.isUndefined(return_parameters)){ return_parameters = {}; }

      let vendor = {
        required:{
          request_response_format:'response_format',
          request_api_version:'api_version'
        }
      };

      let vendor_configuration = this.get('VendorConfiguration');

      objectutilities.map(vendor.required, (key) => {

        let six_key = vendor.required[key];

        if(!_.has(vendor_configuration, six_key)){
          eu.throwError('server', 'Missing vendor configuration field: "'+six_key+'".');
        }

        return_parameters[key] = vendor_configuration[six_key];

      });

      return return_parameters;

    }

    setMerchantProviderParameters({return_parameters}){

      du.debug('Set Merchant Provider Parameters');

      if(_.isUndefined(return_parameters)){ return_parameters = {}; }

      let merchant_provider = {
        required: {
          req_username: 'username',
          req_password:'password',
          site_id: 'site_id',
          merchant_acct_id: 'merchant_account_id',
          li_prod_id_1:'product_id'
        }
      };

      let merchant_provider_configuration = this.get('MerchantProviderParameters');

      objectutilities.map(merchant_provider.required, (key) => {

        let six_key = merchant_provider.required[key];

        if(!_.has(merchant_provider_configuration, six_key)){
          eu.throwError('server', 'Missing Merchant Provider parameters field: "'+six_key+'".');
        }

        return_parameters[key] = merchant_provider_configuration[six_key];

      });

      return return_parameters;

    }

    setRequestParameters({request_parameters: request_parameters, return_parameters: return_parameters}){

      du.debug('Set Request Parameters');

      let parameters = {
        required: {
          li_value_1:'amount',
          li_count_1:'count',
          pmt_numb:'creditcard.number',
          pmt_key:'creditcard.ccv',
          pmt_expiry:'creditcard.expiration'
        },
        optional:{
          cust_fname:'customer.firstname',
          cust_lname:'customer.lastname',
          cust_email:'customer.email',
          //cust_login:'',
          //cust_password:'',
          bill_addr:'creditcard.address.line1',
          bill_addr_city:'creditcard.address.city',
          bill_addr_state:'creditcard.address.state',
          bill_addr_zip:'creditcard.address.zip',
          bill_addr_country:'creditcard.address.country',
          xtl_order_id:'transaction.alias',
          xtl_cust_id:'customer.id',
          xtl_ip:'session.ip_address'
        }
      };

      //Technical Debt:  Let's create a method in Object Utilities called "Transcribe to handle this...
      objectutilities.map(parameters.required, (key) => {

        let six_key = parameters.required[key];

        if(!objectutilities.hasRecursive(request_parameters, six_key)){
          eu.throwError('server', 'Missing request parameters field: "'+six_key+'".');
        }

        return_parameters[key] = objectutilities.getKey(request_parameters, six_key, true);

      });

      objectutilities.map(parameters.optional, (key) => {

        let six_key = parameters.optional[key];

        if(objectutilities.hasRecursive(request_parameters, six_key)){
          return_parameters[key] = objectutilities.getKey(request_parameters, six_key, true);
        }

      });

      return return_parameters;

    }

    createParameterObject(){

      du.debug('Create Parameter Object');

      let return_parameters = this.setVendorParameters({return_parameters:{}});

      return_parameters = this.setMerchantProviderParameters({return_parameters:return_parameters});

      return return_parameters;

    }

}

module.exports = InnovioController;
