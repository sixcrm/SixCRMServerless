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

      this.merchant_provider_parameters = {
        required: {
          req_username: 'username',
          req_password:'password',
          site_id: 'site_id',
          merchant_acct_id: 'merchant_account_id',
          li_prod_id_1:'product_id'
        },
        optional:{}
      };

      this.method_parameters = {
        required: {
          request_action: 'request_action'
        }
      }

      this.vendor_parameters = {
        required:{
          request_response_format:'response_format',
          request_api_version:'api_version'
        }
      };

      this.transaction_parameters = {
        process: {
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
        },
        refund: {
          required:{
            request_ref_po_id:'transaction.processor_response.result.TRANS_ID',
            li_value_1:'amount'
          }
        },
        void: {
          required:{
            request_ref_po_id:'transaction.processor_response.result.PO_ID'
          }
        }
      };

    }

    process(request_parameters){

      du.debug('Process');

      const method_parameters = {request_action: 'CCAUTHCAP'};

      return this.postToProcessor({action: 'process', method_parameters: method_parameters, request_parameters: request_parameters})
      .then((response_object) => this.getResponseObject(response_object));

    }

    refund(request_parameters){

      du.debug('Refund');

      const method_parameters = {request_action: 'CCCREDIT'};

      return this.postToProcessor({action: 'refund', method_parameters: method_parameters, request_parameters: request_parameters})
      .then((response) => this.getResponseObject(response));

    }

    void(request_parameters){

      du.debug('Void');

      const method_parameters = {request_action: 'CCREVERSE'};

      return this.postToProcessor({action: 'void', method_parameters: method_parameters, request_parameters: request_parameters})
      .then((response) => this.getResponseObject(response));

    }

}

module.exports = InnovioController;
