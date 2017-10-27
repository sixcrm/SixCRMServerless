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

      this.merchant_provider_parameters = {
        required: {
          username: 'username',
          password:'password',
        },
        optional: {
          processor_id: 'processor_id'
        }
      };

      this.method_parameters = {
        required: {
          type: 'type'
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
            transactionid:'transaction.processor_response.result.transactionid'
          },
          optional:{
            amount:'amount'
          }
        },
        void: {
          required:{
            transactionid:'transaction.processor_response.result.transactionid'
          },
          optional:{
            amount:'amount'
          }
        }
      };

    }

    refund(request_parameters){

      du.debug('Refund');

      const method_parameters = {type: 'refund'};

      return this.postToProcessor({action: 'refund', method_parameters: method_parameters, request_parameters: request_parameters})
      .then((response_object) => this.getResponseObject(response_object));

    }

    void(request_parameters){

      du.debug('Void');

      const method_parameters = {type: 'void'};

      return this.postToProcessor({action: 'void', method_parameters: method_parameters, request_parameters: request_parameters})
      .then((response_object) => this.getResponseObject(response_object));

    }

    process(request_parameters){

      du.debug('Process');

      const method_parameters = {type: 'sale'};

      return this.postToProcessor({action: 'process', method_parameters: method_parameters, request_parameters: request_parameters})
      .then((response_object) => this.getResponseObject(response_object));

    }

}

module.exports = NMIController;
