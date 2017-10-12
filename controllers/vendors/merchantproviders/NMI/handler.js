'use strict';
const _ = require('underscore');
const request = require('request');
const querystring = require('querystring');

const du = global.SixCRM.routes.include('lib', 'debug-utilities');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

const MerchantProvider = global.SixCRM.routes.include('vendors', 'merchantproviders/MerchantProvider.js');

class NMIController extends MerchantProvider {

    //Technical Debt:  Need to make use of processor_id somewhere...
    constructor(merchant_provider_parameters){

      super();

      this.configure(merchant_provider_parameters);

      this.transaction_parameters = {
        process: {
          required: {
            amount:'amount',
            ccnumber:'creditcard.number',
            ccv:'creditcard.ccv',
            ccexp:'creditcard.expiration'
          },
          optional:{
            firstname:'customer.firstname',
            lastname:'customer.lastname',
            address1:'creditcard.address.line1',
            address2:'creditcard.address.line2',
            city:'creditcard.address.city',
            state:'creditcard.address.state',
            zip:'creditcard.address.zip',
            country:'creditcard.address.country',
            shipping_address1: 'customer.address.line1',
            shipping_address2: 'customer.address.line2',
            shipping_city: 'customer.address.city',
            shipping_state: 'customer.address.state',
            shipping_zip: 'customer.address.zip',
            shipping_country: 'customer.address.country'
          }
        },
        refund: {
          required:{
            transactionid:'transaction_id'
          },
          optional:{
            amount:'amount'
          }
        },
        void: {
          required:{
            transactionid:'transaction_id'
          },
          optional:{
            amount:'amount'
          }
        }
      };

    }

    refund(request_parameters){

      du.debug('Refund');

      return new Promise((resolve, reject) => {

        const method_parameters = {type: 'refund'};

        let parameters = this.createParameterObject();

        parameters = this.setMethodParameters({method_parameters: method_parameters, return_parameters: parameters});

        parameters = this.setRequestParameters({type: 'refund', request_parameters: request_parameters, return_parameters: parameters});

        this.validateRequestParameters('refund', parameters);

        var request_options = {
  			  headers: {'content-type' : 'application/x-www-form-urlencoded'},
  			  url:     this.get('VendorConfiguration').endpoint,
  			  body:    querystring.stringify(parameters)
        };

        request.post(request_options, (error, response, body) => {

          if(_.isError(error)){
            reject(error);
          }

          resolve(this.getResponseObject({error: error, response: response, body: body}));

        });

      });

    }

    void(request_parameters){

      du.debug('Void');

      return new Promise((resolve, reject) => {

        const method_parameters = {type: 'void'};

        let parameters = this.createParameterObject();

        parameters = this.setMethodParameters({method_parameters: method_parameters, return_parameters: parameters});

        parameters = this.setRequestParameters({type: 'void', request_parameters: request_parameters, return_parameters: parameters});

        this.validateRequestParameters('void', parameters);

        var request_options = {
  			  headers: {'content-type' : 'application/x-www-form-urlencoded'},
  			  url:     this.get('VendorConfiguration').endpoint,
  			  body:    querystring.stringify(parameters)
        };

        request.post(request_options, (error, response, body) => {

          if(_.isError(error)){
            reject(error);
          }

          resolve(this.getResponseObject({error: error, response: response, body: body}));

        });

      });

    }

    process(request_parameters){

      du.debug('Process');

      return new Promise((resolve, reject) => {

        const method_parameters = {type: 'sale'};

        let parameters = this.createParameterObject();

        parameters = this.setMethodParameters({method_parameters: method_parameters, return_parameters: parameters});

        parameters = this.setRequestParameters({type: 'process', request_parameters: request_parameters, return_parameters: parameters});

        this.validateRequestParameters('process', parameters);

        var request_options = {
  			  headers: {'content-type' : 'application/x-www-form-urlencoded'},
  			  url:     this.get('VendorConfiguration').endpoint,
  			  body:    querystring.stringify(parameters)
        };

        request.post(request_options, (error, response, body) => {

          if(_.isError(error)){
            reject(error);
          }

          resolve(this.getResponseObject({error: error, response: response, body: body}));

        });

      });

    }

    setRequestParameters({type, request_parameters, return_parameters}){

      du.debug('Set Request Parameters');

      objectutilities.hasRecursive(this.transaction_parameters, type+'.required', true);
      objectutilities.hasRecursive(this.transaction_parameters, type+'.optional', true);

      return_parameters = objectutilities.transcribe(this.transaction_parameters[type].required, request_parameters, return_parameters, true);
      return objectutilities.transcribe(this.transaction_parameters[type].optional, request_parameters, return_parameters, false);

    }

    createParameterObject(){

      du.debug('Create Parameter Object');

      let return_parameters = this.setVendorParameters({return_parameters:{}});

      return_parameters = this.setMerchantProviderParameters({return_parameters:return_parameters});

      return return_parameters;

    }

    setVendorParameters({return_parameters}){

      du.debug('Set Vendor Parameters');

      let vendor = {
        required:{
          endpoint:'endpoint'
        }
      };

      let vendor_configuration = this.get('VendorConfiguration');

      return objectutilities.transcribe(vendor.required, vendor_configuration, return_parameters, true);

    }

    setMerchantProviderParameters({return_parameters}){

      du.debug('Set Merchant Provider Parameters');

      let merchant_provider = {
        required: {
          username: 'username',
          password:'password',
        },
        optional: {
          processor_id: 'processor_id'
        }
      };

      let merchant_provider_configuration = this.get('MerchantProviderParameters');

      return_parameters = objectutilities.transcribe(merchant_provider.required, merchant_provider_configuration, return_parameters, true);

      return objectutilities.transcribe(merchant_provider.optional, merchant_provider_configuration, return_parameters);

    }

    setMethodParameters({return_parameters, method_parameters}){

      du.debug('Set Method Parameters');

      let method = {
        required: {
          type: 'type'
        }
      };

      return objectutilities.transcribe(method.required, method_parameters, return_parameters, true);

    }

}

module.exports = NMIController;
