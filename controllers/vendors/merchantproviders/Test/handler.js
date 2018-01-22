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

class TestController extends MerchantProvider {

    //Technical Debt:  Need to make use of processor_id somewhere...
    constructor(merchant_provider_parameters){

      super();

      this.configure(merchant_provider_parameters);

      this.merchant_provider_parameters = {
        required: {
        },
        optional: {
          username: 'username',
          password:'password',
          processor_id: 'processor_id'
        }
      };

      this.method_parameters = {
        required: {
          path: 'path'
        }
      };

      this.vendor_parameters = {
        required:{
          endpoint:'endpoint'
        }
      };

      this.transaction_parameters = {
        process: {
          required: {
            amount:'amount',
            creditcard:'creditcard',
            customer:'customer'
          },
          optional:{}
        },
        refund: {
          required:{
            transactionid:'transaction.processor_response.result.transactionid'
          },
          optional:{
            amount:'amount'
          }
        },
        reverse: {
          required:{
            transactionid:'transaction.processor_response.result.transactionid'
          }
        }
      };

    }

    /* Currently not supported
    refund(request_parameters){

      du.debug('Refund');

      const method_parameters = {type: 'refund'};

      return this.postToProcessor({action: 'refund', method_parameters: method_parameters, request_parameters: request_parameters})
      .then((response_object) => this.getResponseObject(response_object));

    }

    */

    /* Currently not supported
    reverse(request_parameters){

      du.debug('Reverse');

      const method_parameters = {type: 'void'};

      return this.postToProcessor({action: 'reverse', method_parameters: method_parameters, request_parameters: request_parameters})
      .then((response_object) => this.getResponseObject(response_object));

    }
    */

    process(request_parameters){

      du.debug('Process');

      const method_parameters = {
        path: 'authorize'
      };

      return this.postToProcessor({action: 'process', method_parameters: method_parameters, request_parameters: request_parameters})
      .then((response_object) => this.getResponseObject(response_object));

    }

    setRequestParameters({type, request_parameters, return_parameters}){

      du.debug('Set Request Parameters');

      objectutilities.hasRecursive(this.transaction_parameters, type+'.required', true);

      return_parameters = objectutilities.transcribe(this.transaction_parameters[type].required, request_parameters, return_parameters, true);

      if(objectutilities.hasRecursive(this.transaction_parameters, type+'.optional')){
        return_parameters = objectutilities.transcribe(this.transaction_parameters[type].optional, request_parameters, return_parameters, false);
      }

      delete return_parameters.customer.id;
      delete return_parameters.customer.email;
      delete return_parameters.endpoint;
      delete return_parameters.username;
      delete return_parameters.password;
      delete return_parameters.path;

      return return_parameters;

    }

    postToProcessor({action, method_parameters, request_parameters}){

      du.debug('Post To Processor');

      return new Promise((resolve, reject) => {

        let parameters = this.createParameterObject();

        let endpoint = this.createEndpoint(method_parameters);

        parameters = this.setMethodParameters({method_parameters: method_parameters, return_parameters: parameters});

        parameters = this.setRequestParameters({type: action, request_parameters: request_parameters, return_parameters: parameters});

        this.validateRequestParameters(action, parameters);

        var request_options = {
          method: 'post',
          body: parameters,
          json: true,
          url: endpoint
        }

        request(request_options, (error, response, body) => {

          if(_.isError(error)){
            du.error(error);
            reject(error);
          }

          resolve({response: response, body: body});

        });

      });

    }

}

module.exports = TestController;
